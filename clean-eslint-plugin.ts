#!/usr/bin/env bun

/**
 * 清理 vite 配置文件和 package.json 中 eslint 相关的代码
 * 
 * 功能：
 * 1. 移除 vite 配置文件中 import eslintPlugin from 'vite-plugin-eslint' 导入语句
 * 2. 移除 vite 配置文件中 eslintPlugin 相关的配置代码（包括注释掉的）
 * 3. 移除 package.json 中 eslint 相关的 script 命令
 * 
 * 用法:
 *   bun clean-eslint-plugin.ts [文件路径...] [options]
 * 
 * 示例:
 *   bun clean-eslint-plugin.ts                                    # 自动查找所有相关文件
 *   bun clean-eslint-plugin.ts vite.config.ts                    # 清理指定文件
 *   bun clean-eslint-plugin.ts --dry-run                          # 预览模式，不实际修改
 *   bun clean-eslint-plugin.ts --help                             # 显示帮助信息
 */

import { readdir, readFile, writeFile } from 'fs/promises'
import { join, relative } from 'path'

interface CleanResult {
  file: string
  cleaned: boolean
  removedImports: number
  removedConfigs: number
  removedScripts: number
}

interface Options {
  dryRun: boolean
  files: string[]
}

/**
 * 解析命令行参数
 */
function parseArgs(): Options {
  const args = process.argv.slice(2)
  
  // 检查帮助选项
  if (args.includes('--help') || args.includes('-h')) {
    process.exit(0)
  }
  
  let dryRun = false
  const files: string[] = []
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    if (arg === '--dry-run' || arg === '-n') {
      dryRun = true
    } else if (!arg.startsWith('--') && !arg.startsWith('-')) {
      // 不是选项，视为文件路径
      files.push(arg)
    } else {
      process.exit(1)
    }
  }
  
  return { dryRun, files }
}

/**
 * 清理单个文件中的 vite-plugin-eslint 相关代码
 */
async function cleanFile(filePath: string, dryRun: boolean = false): Promise<CleanResult> {
  const content = await readFile(filePath, 'utf-8')
  let cleaned = false
  let removedImports = 0
  let removedConfigs = 0
  let newContent = content

  // 1. 移除 import eslintPlugin 相关的导入语句
  // 匹配各种导入格式：
  // - import eslintPlugin from 'vite-plugin-eslint'
  // - import eslintPlugin, { ... } from 'vite-plugin-eslint'
  // - import { default as eslintPlugin } from 'vite-plugin-eslint'
  const importPattern = /import\s+eslintPlugin(?:\s*,\s*\{[^}]*\})?\s+from\s+['"]vite-plugin-eslint['"];?\s*\n/g
  const importMatches = newContent.match(importPattern)
  if (importMatches) {
    newContent = newContent.replace(importPattern, '')
    removedImports = importMatches.length
    cleaned = true
  }

  // 2. 移除 eslintPlugin 相关的配置代码
  // 匹配注释掉的 eslintPlugin 配置（单行注释，可能多行）
  // 例如：
  // // eslintPlugin({
  // //   include: ['src/**/*.{ts,tsx}'],
  // // }),
  // 使用逐行处理的方式，更精确地匹配 eslintPlugin 相关的配置
  const lines = newContent.split('\n')
  const cleanedLines: string[] = []
  let inEslintPluginComment = false
  let inEslintPluginConfig = false
  let braceCount = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()
    
    // 检查是否开始了一个 eslintPlugin 注释块
    if (trimmedLine.startsWith('//') && trimmedLine.includes('eslintPlugin(')) {
      inEslintPluginComment = true
      // 检查是否在同一行结束
      if (trimmedLine.includes('),') || trimmedLine.includes('})')) {
        // 单行注释，直接跳过
        inEslintPluginComment = false
        removedConfigs++
        cleaned = true
        continue
      }
      // 多行注释开始，跳过这一行
      removedConfigs++
      cleaned = true
      continue
    }
    
    // 如果在 eslintPlugin 注释块中
    if (inEslintPluginComment) {
      // 检查是否结束（包含 }), 或 ),）
      if (trimmedLine.includes('//') && (trimmedLine.includes('),') || trimmedLine.includes('})'))) {
        // 注释块结束，跳过这一行
        inEslintPluginComment = false
        continue
      }
      // 注释块中间的行，跳过
      continue
    }
    
    // 检查未注释的 eslintPlugin 配置
    if (!trimmedLine.startsWith('//') && trimmedLine.includes('eslintPlugin(')) {
      inEslintPluginConfig = true
      // 计算括号和花括号
      braceCount = (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length
      braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length
      
      // 检查是否在同一行结束
      if (trimmedLine.includes('),') || trimmedLine.includes('})')) {
        // 单行配置，直接跳过
        inEslintPluginConfig = false
        removedConfigs++
        cleaned = true
        continue
      }
      // 多行配置开始，跳过这一行
      removedConfigs++
      cleaned = true
      continue
    }
    
    // 如果在未注释的 eslintPlugin 配置中
    if (inEslintPluginConfig) {
      // 更新括号计数
      braceCount += (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length
      braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length
      
      // 检查是否结束（括号和花括号都闭合，且包含 , 或 }）
      if (braceCount <= 0 && (trimmedLine.includes('),') || trimmedLine.includes('})') || trimmedLine.endsWith(','))) {
        // 配置块结束，跳过这一行
        inEslintPluginConfig = false
        braceCount = 0
        continue
      }
      // 配置块中间的行，跳过
      continue
    }
    
    // 正常行，保留
    cleanedLines.push(line)
  }
  
  newContent = cleanedLines.join('\n')

  // 匹配注释掉的 eslintPlugin 配置块（多行注释 /* ... */）
  const commentedBlockPattern = /\/\*[\s\S]*?eslintPlugin\([^)]*\)[\s\S]*?\*\/\s*\n?/g
  const blockMatches = newContent.match(commentedBlockPattern)
  if (blockMatches) {
    newContent = newContent.replace(commentedBlockPattern, '')
    removedConfigs += blockMatches.length
    cleaned = true
  }

  // 3. 清理可能的空行（连续两个空行变为一个）
  newContent = newContent.replace(/\n{3,}/g, '\n\n')

  // 4. 如果文件被修改，写入新内容（除非是预览模式）
  if (cleaned && newContent !== content) {
    if (!dryRun) {
      await writeFile(filePath, newContent, 'utf-8')
    }
  }

  return {
    file: filePath,
    cleaned,
    removedImports,
    removedConfigs,
    removedScripts: 0,
  }
}

/**
 * 清理 package.json 中的 eslint 相关 script
 */
async function cleanPackageJson(filePath: string, dryRun: boolean = false): Promise<CleanResult> {
  const content = await readFile(filePath, 'utf-8')
  let cleaned = false
  let removedScripts = 0
  
  try {
    const packageJson = JSON.parse(content)
    
    if (packageJson.scripts && typeof packageJson.scripts === 'object') {
      const scripts = packageJson.scripts
      const scriptKeys = Object.keys(scripts)
      const scriptsToRemove: string[] = []
      
      // 查找包含 eslint 的 script
      for (const key of scriptKeys) {
        const scriptValue = scripts[key]
        if (typeof scriptValue === 'string' && scriptValue.includes('eslint')) {
          scriptsToRemove.push(key)
        }
      }
      
      if (scriptsToRemove.length > 0) {
        cleaned = true
        removedScripts = scriptsToRemove.length
        
        // 移除这些 script
        for (const key of scriptsToRemove) {
          delete scripts[key]
        }
        
        // 如果 scripts 对象为空，可以选择删除它，但通常保留空对象也没问题
        // 这里我们保留空对象
        
        if (!dryRun) {
          // 格式化 JSON，保持缩进
          const newContent = JSON.stringify(packageJson, null, 2) + '\n'
          await writeFile(filePath, newContent, 'utf-8')
        }
      }
    }
  } catch (error) {
    // JSON 解析失败，跳过
    throw new Error(`无法解析 package.json: ${error}`)
  }
  
  return {
    file: filePath,
    cleaned,
    removedImports: 0,
    removedConfigs: 0,
    removedScripts,
  }
}

/**
 * 递归查找所有 vite 配置文件
 */
async function findViteConfigFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      
      // 跳过 node_modules 和 dist 目录
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
          continue
        }
        // 递归查找子目录
        const subFiles = await findViteConfigFiles(fullPath)
        files.push(...subFiles)
      } else if (entry.isFile()) {
        const fileName = entry.name
        // 匹配 vite.config.ts, vite.*.config.ts 等
        if (/^vite.*\.config\.(ts|js|mjs|cjs)$/.test(fileName)) {
          files.push(fullPath)
        }
      }
    }
  } catch (error) {
    // 忽略权限错误等
    if (error instanceof Error && !error.message.includes('ENOENT')) {
    }
  }
  
  return files
}

/**
 * 递归查找所有 package.json 文件
 */
async function findPackageJsonFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      
      // 跳过 node_modules 和 dist 目录
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
          continue
        }
        // 递归查找子目录
        const subFiles = await findPackageJsonFiles(fullPath)
        files.push(...subFiles)
      } else if (entry.isFile()) {
        const fileName = entry.name
        // 匹配 package.json
        if (fileName === 'package.json') {
          files.push(fullPath)
        }
      }
    }
  } catch (error) {
    // 忽略权限错误等
    if (error instanceof Error && !error.message.includes('ENOENT')) {
    }
  }
  
  return files
}

/**
 * 判断文件类型
 */
function getFileType(filePath: string): 'vite' | 'package' | 'unknown' {
  const fileName = filePath.split(/[/\\]/).pop() || ''
  if (/^vite.*\.config\.(ts|js|mjs|cjs)$/.test(fileName)) {
    return 'vite'
  }
  if (fileName === 'package.json') {
    return 'package'
  }
  return 'unknown'
}

/**
 * 主函数
 */
async function main() {
  const options = parseArgs()
  const cwd = process.cwd()
  
  let viteFilesToClean: string[] = []
  let packageFilesToClean: string[] = []
  
  if (options.files.length > 0) {
    // 如果提供了文件路径，使用提供的路径并分类
    for (const arg of options.files) {
      const filePath = arg.startsWith('/') ? arg : join(cwd, arg)
      const fileType = getFileType(filePath)
      if (fileType === 'vite') {
        viteFilesToClean.push(filePath)
      } else if (fileType === 'package') {
        packageFilesToClean.push(filePath)
      }
    }
  } else {
    // 否则递归查找所有相关文件
    viteFilesToClean = await findViteConfigFiles(cwd)
    packageFilesToClean = await findPackageJsonFiles(cwd)
  }
  
  const totalFiles = viteFilesToClean.length + packageFilesToClean.length
  
  if (totalFiles === 0) {
    return
  }
  
  if (options.dryRun) {
  } else {
  }
  
  const results: CleanResult[] = []
  
  // 处理 vite 配置文件
  for (const file of viteFilesToClean) {
    try {
      const result = await cleanFile(file, options.dryRun)
      results.push(result)
      
      const relativePath = relative(cwd, file)
      
      if (result.cleaned) {
        const prefix = options.dryRun ? '🔍' : '✓'
        if (result.removedImports > 0) {
        }
        if (result.removedConfigs > 0) {
        }
      } else {
      }
    } catch (error) {
      const relativePath = relative(cwd, file)
    }
  }
  
  // 处理 package.json 文件
  for (const file of packageFilesToClean) {
    try {
      const result = await cleanPackageJson(file, options.dryRun)
      results.push(result)
      
      const relativePath = relative(cwd, file)
      
      if (result.cleaned) {
        const prefix = options.dryRun ? '🔍' : '✓'
        if (result.removedScripts > 0) {
        }
      } else {
      }
    } catch (error) {
      const relativePath = relative(cwd, file)
    }
  }
  
  const cleanedCount = results.filter(r => r.cleaned).length
  if (options.dryRun) {
  } else {
  }
}

// 运行主函数
main().catch((function(){}))
