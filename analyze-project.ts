#!/usr/bin/env bun

/**
 * 项目分析脚本
 * 
 * 功能：
 * 1. 分析各子项目非代码静态资源内嵌情况（如：png ttf等）
 * 2. 统计静态资源总大小（按子项目）
 * 3. 统计项目中不规范定义版本情况
 * 4. 查找在 catalog 或 catalogs 中定义的依赖在所有子项目中被依赖的情况
 * 5. 统计各子项目所有文件类型和文件大小统计（如 .vue .ts .tsx .js 等）
 * 6. 统计各子项目的 git 贡献者代码行数
 * 
 * 用法:
 *   bun analyze-project.ts [--assets] [--versions] [--catalog-deps] [--file-types] [--contributors] [--all]
 * 
 * 示例:
 *   bun analyze-project.ts --all
 *   bun analyze-project.ts --assets
 *   bun analyze-project.ts --versions
 *   bun analyze-project.ts --catalog-deps
 *   bun analyze-project.ts --file-types
 *   bun analyze-project.ts --contributors
 */

import { readdirSync, readFileSync, statSync } from 'fs'
import { join, relative } from 'path'
import { execSync } from 'child_process'

interface PackageJson {
  name?: string
  version?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  [key: string]: any
}

interface RootPackageJson extends PackageJson {
  workspaces?: {
    packages?: string[]
    catalog?: Record<string, string>
    catalogs?: Record<string, Record<string, string>>
  }
}

interface AssetInfo {
  path: string
  size: number
  type: string
}

interface ProjectAssets {
  projectPath: string
  projectName: string
  assets: AssetInfo[]
  totalSize: number
}

interface VersionIssue {
  projectPath: string
  projectName: string
  dependency: string
  version: string
  type: string
  issue: string
}

interface CatalogDependency {
  catalogName: string
  dependency: string
  version: string
  usedIn: Array<{
    projectPath: string
    projectName: string
    version: string
    type: string
  }>
}

interface FileTypeStats {
  extension: string
  count: number
  totalSize: number
}

interface ProjectFileTypes {
  projectPath: string
  projectName: string
  fileTypes: FileTypeStats[]
  totalFiles: number
  totalSize: number
}

interface ContributorStats {
  author: string
  lines: number
  commits: number
  files?: Array<{ filename: string; lines: number; commits: number }>
}

interface ContributorSummary {
  author: string
  totalLines: number
  totalCommits: number
  languages: Array<{ language: string; lines: number }>
  topFiles: Array<{ filename: string; commits: number; lines: number }>
}

interface ProjectContributors {
  projectPath: string
  projectName: string
  contributors: ContributorStats[]
  totalLines: number
  totalCommits: number
}

// 静态资源文件扩展名
const ASSET_EXTENSIONS = [
  // 图片
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp', 'tiff',
  // 字体
  'ttf', 'otf', 'woff', 'woff2', 'eot',
  // 其他
  'pdf', 'zip', 'rar', '7z', 'tar', 'gz',
  // 视频
  'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm',
  // 音频
  'mp3', 'wav', 'ogg', 'aac', 'flac',
]

// 应该忽略的目录
const IGNORE_DIRS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  '.vscode',
  '.idea',
  'coverage',
  '.next',
  '.nuxt',
  '.cache',
  'temp',
  'tmp',
]

// 代码文件扩展名（用于文件类型统计）
const CODE_FILE_EXTENSIONS = [
  // TypeScript/JavaScript
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs',
  // Vue
  'vue',
  // 样式
  'css', 'less', 'scss', 'sass', 'styl',
  // 其他
  'json', 'md', 'html', 'htm', 'xml', 'yaml', 'yml',
  // 配置文件
  'config', 'conf', 'ini',
]

// 文件扩展名到语言类型的映射
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  // TypeScript
  ts: 'TypeScript',
  tsx: 'TypeScript',
  // JavaScript
  js: 'JavaScript',
  jsx: 'JavaScript',
  mjs: 'JavaScript',
  cjs: 'JavaScript',
  // Vue
  vue: 'Vue',
  // 样式
  css: 'CSS',
  less: 'Less',
  scss: 'Sass',
  sass: 'Sass',
  styl: 'Stylus',
  // 标记语言
  html: 'HTML',
  htm: 'HTML',
  xml: 'XML',
  // 数据格式
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  // 文档
  md: 'Markdown',
  // 其他
  config: 'Config',
  conf: 'Config',
  ini: 'Config',
}

/**
 * 检查路径是否应该被忽略
 */
function shouldIgnore(path: string): boolean {
  const parts = path.split(/[/\\]/)
  return IGNORE_DIRS.some((dir) => parts.includes(dir))
}

/**
 * 获取文件扩展名
 */
function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * 根据文件名获取语言类型
 */
function getLanguageFromFilename(filename: string): string {
  const ext = getFileExtension(filename)
  return EXTENSION_TO_LANGUAGE[ext] || 'Other'
}

/**
 * 将 glob 模式转换为正则表达式
 */
function globToRegex(pattern: string): RegExp {
  // 处理以 / 结尾的模式（目录模式）
  const isDirectoryPattern = pattern.endsWith('/')
  let processedPattern = pattern
  if (isDirectoryPattern) {
    // 移除末尾的 /，但保留模式用于后续处理
    processedPattern = pattern.slice(0, -1)
  }

  // 转义特殊字符，但保留 glob 通配符
  let regexStr = processedPattern.replace(/[.+^${}()|[\]\\]/g, '\\$&')
  // 临时替换 **
  regexStr = regexStr.replace(/\*\*/g, '___DOUBLE_STAR___')
  // * 匹配除 / 外的任意字符
  regexStr = regexStr.replace(/\*/g, '[^/]*')
  // ** 匹配任意字符（包括 /）
  regexStr = regexStr.replace(/___DOUBLE_STAR___/g, '.*')
  // ? 匹配单个字符（除 / 外）
  regexStr = regexStr.replace(/\?/g, '[^/]')

  // 如果模式以 / 开头，从路径开始匹配
  if (pattern.startsWith('/')) {
    regexStr = `^${regexStr}`
  } else {
    // 否则允许匹配路径的任何部分
    regexStr = `(^|/)${regexStr}`
  }

  // 如果模式以 / 结尾（目录模式），匹配目录及其所有内容
  if (isDirectoryPattern) {
    // 匹配目录后跟 /，后面可以跟任何内容（包括子目录和文件）
    regexStr = `${regexStr}/`
  } else {
    // 否则允许匹配到路径末尾或目录
    regexStr = `${regexStr}(/|$)`
  }

  return new RegExp(regexStr)
}

/**
 * 解析 .gitignore 文件
 */
function parseGitignore(gitignorePath: string, rootDir: string): string[] {
  const patterns: string[] = []
  try {
    const content = readFileSync(gitignorePath, 'utf-8')
    const lines = content.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      // 跳过空行和注释
      if (!trimmed || trimmed.startsWith('#')) {
        continue
      }

      // 处理否定模式（以 ! 开头）
      if (trimmed.startsWith('!')) {
        // 暂时跳过否定模式，简化处理
        continue
      }

      patterns.push(trimmed)
    }
  } catch {
    // 文件不存在或无法读取，返回空数组
  }

  return patterns
}

/**
 * 检查文件路径是否匹配 gitignore 模式
 */
function matchesGitignorePattern(filePath: string, pattern: string, rootDir: string): boolean {
  try {
    const relativePath = relative(rootDir, filePath).replace(/\\/g, '/')
    const regex = globToRegex(pattern)
    return regex.test(relativePath) || regex.test(filePath.replace(/\\/g, '/'))
  } catch {
    return false
  }
}

/**
 * 检查文件是否应该被忽略（基于 gitignore 模式）
 */
function shouldIgnoreFile(filePath: string, ignorePatterns: string[], rootDir: string): boolean {
  for (const pattern of ignorePatterns) {
    if (matchesGitignorePattern(filePath, pattern, rootDir)) {
      return true
    }
  }
  return false
}

/**
 * 判断是否为静态资源文件
 */
function isAssetFile(filename: string): boolean {
  const ext = getFileExtension(filename)
  return ASSET_EXTENSIONS.includes(ext)
}

/**
 * 递归查找所有静态资源文件
 */
function findAssetFiles(
  dir: string,
  baseDir: string,
  assets: AssetInfo[] = []
): AssetInfo[] {
  try {
    const entries = readdirSync(dir)

    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const relativePath = relative(baseDir, fullPath)

      if (shouldIgnore(relativePath)) {
        continue
      }

      try {
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
          findAssetFiles(fullPath, baseDir, assets)
        } else if (stat.isFile() && isAssetFile(entry)) {
          const ext = getFileExtension(entry)
          assets.push({
            path: relativePath,
            size: stat.size,
            type: ext,
          })
        }
      } catch {
        // 忽略无法访问的文件
      }
    }
  } catch {
    // 忽略无法访问的目录
  }

  return assets
}

/**
 * 递归查找所有文件并统计类型
 */
function findAndStatFiles(
  dir: string,
  baseDir: string,
  fileStats: Map<string, { count: number; totalSize: number }> = new Map()
): Map<string, { count: number; totalSize: number }> {
  try {
    const entries = readdirSync(dir)

    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const relativePath = relative(baseDir, fullPath)

      if (shouldIgnore(relativePath)) {
        continue
      }

      try {
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
          findAndStatFiles(fullPath, baseDir, fileStats)
        } else if (stat.isFile()) {
          const ext = getFileExtension(entry) || '(no extension)'
          const current = fileStats.get(ext) || { count: 0, totalSize: 0 }
          current.count++
          current.totalSize += stat.size
          fileStats.set(ext, current)
        }
      } catch {
        // 忽略无法访问的文件
      }
    }
  } catch {
    // 忽略无法访问的目录
  }

  return fileStats
}

/**
 * 查找所有 package.json 文件
 */
function findPackageJsonFiles(dir: string, files: string[] = []): string[] {
  try {
    const entries = readdirSync(dir)

    for (const entry of entries) {
      if (entry.startsWith('.') || entry === 'node_modules') {
        continue
      }

      const fullPath = join(dir, entry)

      try {
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
          findPackageJsonFiles(fullPath, files)
        } else if (entry === 'package.json') {
          files.push(fullPath)
        }
      } catch {
        // 忽略无法访问的文件
      }
    }
  } catch {
    // 忽略无法访问的目录
  }

  return files
}

/**
 * 格式化文件大小
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/**
 * 分析静态资源
 */
function analyzeAssets(rootDir: string): ProjectAssets[] {

  const packageFiles = findPackageJsonFiles(rootDir).filter(
    (file) => !file.includes('/node_modules/') && !file.includes('\\node_modules\\')
  )

  const projects: ProjectAssets[] = []

  for (const pkgFile of packageFiles) {
    try {
      const content = readFileSync(pkgFile, 'utf-8')
      const pkg: PackageJson = JSON.parse(content)
      const projectDir = pkgFile.replace('/package.json', '').replace('\\package.json', '')
      const projectName = pkg.name || projectDir.split(/[/\\]/).pop() || 'unknown'

      // 跳过根目录的 package.json
      if (projectDir === rootDir || projectDir === rootDir.replace(/\/$/, '')) {
        continue
      }

      const assets = findAssetFiles(projectDir, projectDir)
      const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0)

      if (assets.length > 0) {
        projects.push({
          projectPath: relative(rootDir, projectDir),
          projectName,
          assets,
          totalSize,
        })
      }
    } catch {
      // 忽略解析错误
    }
  }

  // 按总大小排序
  projects.sort((a, b) => b.totalSize - a.totalSize)

  return projects
}

/**
 * 检查版本是否规范
 */
function isVersionValid(
  depName: string,
  version: string,
  rootCatalog: Record<string, string>,
  rootCatalogs: Record<string, Record<string, string>>
): {
  valid: boolean
  issue: string
} {
  // workspace 协议是允许的
  if (version.startsWith('workspace:')) {
    return { valid: true, issue: '' }
  }

  // catalog 协议是允许的
  if (version.startsWith('catalog:')) {
    return { valid: true, issue: '' }
  }

  // 检查是否在 catalog 中定义
  const inCatalog = depName in rootCatalog
  const inCatalogs = Object.values(rootCatalogs).some((cat) => depName in cat)

  // 如果在 catalog 中定义，但没有使用 catalog: 协议，这是问题
  if (inCatalog || inCatalogs) {
    return {
      valid: false,
      issue: '依赖已在 catalog 中定义，应该使用 catalog: 协议引用',
    }
  }

  // 不允许不确定版本（^ 或 ~ 开头）
  if (version.startsWith('^') || version.startsWith('~')) {
    return {
      valid: false,
      issue: '使用了不确定版本（^ 或 ~），应该在 catalog 中定义固定版本并使用 catalog: 协议',
    }
  }

  // 允许固定版本号（但建议使用 catalog）
  if (/^\d+\.\d+\.\d+/.test(version)) {
    return {
      valid: false,
      issue: '使用了固定版本号，建议在 catalog 中定义并使用 catalog: 协议',
    }
  }

  // 允许 latest（但建议使用 catalog）
  if (version === 'latest') {
    return {
      valid: false,
      issue: '使用了 latest，建议在 catalog 中定义固定版本并使用 catalog: 协议',
    }
  }

  // 其他情况视为不规范
  return {
    valid: false,
    issue: '版本格式不规范，应该在 catalog 中定义固定版本并使用 catalog: 协议',
  }
}

/**
 * 分析版本规范
 */
function analyzeVersions(rootDir: string): VersionIssue[] {

  const rootPkgFile = join(rootDir, 'package.json')
  const rootContent = readFileSync(rootPkgFile, 'utf-8')
  const rootPkg: RootPackageJson = JSON.parse(rootContent)

  const rootCatalog = rootPkg.workspaces?.catalog || {}
  const rootCatalogs = rootPkg.workspaces?.catalogs || {}

  const packageFiles = findPackageJsonFiles(rootDir).filter(
    (file) => !file.includes('/node_modules/') && !file.includes('\\node_modules\\')
  )

  const issues: VersionIssue[] = []

  for (const pkgFile of packageFiles) {
    try {
      const content = readFileSync(pkgFile, 'utf-8')
      const pkg: PackageJson = JSON.parse(content)
      const projectDir = pkgFile.replace('/package.json', '').replace('\\package.json', '')
      const projectName = pkg.name || projectDir.split(/[/\\]/).pop() || 'unknown'

      // 跳过根目录的 package.json
      if (projectDir === rootDir || projectDir === rootDir.replace(/\/$/, '')) {
        continue
      }

      const depTypes: Array<{ deps: Record<string, string> | undefined; type: string }> = [
        { deps: pkg.dependencies, type: 'dependencies' },
        { deps: pkg.devDependencies, type: 'devDependencies' },
        { deps: pkg.peerDependencies, type: 'peerDependencies' },
        { deps: pkg.optionalDependencies, type: 'optionalDependencies' },
      ]

      for (const { deps, type } of depTypes) {
        if (!deps) continue

        for (const [depName, version] of Object.entries(deps)) {
          // 检查版本是否规范
          const validation = isVersionValid(depName, version, rootCatalog, rootCatalogs)
          if (!validation.valid) {
            issues.push({
              projectPath: relative(rootDir, projectDir),
              projectName,
              dependency: depName,
              version,
              type,
              issue: validation.issue,
            })
          }
        }
      }
    } catch {
      // 忽略解析错误
    }
  }

  return issues
}

/**
 * 分析 catalog 依赖使用情况
 */
function analyzeCatalogDependencies(rootDir: string): CatalogDependency[] {

  const rootPkgFile = join(rootDir, 'package.json')
  const rootContent = readFileSync(rootPkgFile, 'utf-8')
  const rootPkg: RootPackageJson = JSON.parse(rootContent)

  const rootCatalog = rootPkg.workspaces?.catalog || {}
  const rootCatalogs = rootPkg.workspaces?.catalogs || {}

  const packageFiles = findPackageJsonFiles(rootDir).filter(
    (file) => !file.includes('/node_modules/') && !file.includes('\\node_modules\\')
  )

  // 收集所有 catalog 中的依赖
  const catalogDeps: Map<string, CatalogDependency> = new Map()

  // 处理根 catalog
  for (const [depName, version] of Object.entries(rootCatalog)) {
    catalogDeps.set(depName, {
      catalogName: 'catalog',
      dependency: depName,
      version,
      usedIn: [],
    })
  }

  // 处理命名 catalogs
  for (const [catalogName, catalog] of Object.entries(rootCatalogs)) {
    for (const [depName, version] of Object.entries(catalog)) {
      const key = `${catalogName}:${depName}`
      catalogDeps.set(key, {
        catalogName: `catalogs.${catalogName}`,
        dependency: depName,
        version,
        usedIn: [],
      })
    }
  }

  // 检查每个子项目的依赖
  for (const pkgFile of packageFiles) {
    try {
      const content = readFileSync(pkgFile, 'utf-8')
      const pkg: PackageJson = JSON.parse(content)
      const projectDir = pkgFile.replace('/package.json', '').replace('\\package.json', '')
      const projectName = pkg.name || projectDir.split(/[/\\]/).pop() || 'unknown'

      // 跳过根目录的 package.json
      if (projectDir === rootDir || projectDir === rootDir.replace(/\/$/, '')) {
        continue
      }

      const depTypes: Array<{ deps: Record<string, string> | undefined; type: string }> = [
        { deps: pkg.dependencies, type: 'dependencies' },
        { deps: pkg.devDependencies, type: 'devDependencies' },
        { deps: pkg.peerDependencies, type: 'peerDependencies' },
        { deps: pkg.optionalDependencies, type: 'optionalDependencies' },
      ]

      for (const { deps, type } of depTypes) {
        if (!deps) continue

        for (const [depName, version] of Object.entries(deps)) {
          // 检查是否使用 catalog
          if (version.startsWith('catalog:')) {
            const catalogRef = version.replace('catalog:', '')
            let catalogKey: string | undefined

            if (catalogRef === '') {
              // catalog: 表示使用根 catalog
              catalogKey = depName
            } else {
              // catalog:name 表示使用命名 catalog
              catalogKey = `${catalogRef}:${depName}`
            }

            const catalogDep = catalogDeps.get(catalogKey)
            if (catalogDep) {
              catalogDep.usedIn.push({
                projectPath: relative(rootDir, projectDir),
                projectName,
                version,
                type,
              })
            }
          } else {
            // 直接检查是否在 catalog 中定义（即使没有使用 catalog: 协议）
            const inRootCatalog = depName in rootCatalog
            if (inRootCatalog) {
              const catalogDep = catalogDeps.get(depName)
              if (catalogDep) {
                catalogDep.usedIn.push({
                  projectPath: relative(rootDir, projectDir),
                  projectName,
                  version,
                  type,
                })
              }
            }

            // 检查命名 catalogs
            for (const [catalogName, catalog] of Object.entries(rootCatalogs)) {
              if (depName in catalog) {
                const catalogKey = `${catalogName}:${depName}`
                const catalogDep = catalogDeps.get(catalogKey)
                if (catalogDep) {
                  catalogDep.usedIn.push({
                    projectPath: relative(rootDir, projectDir),
                    projectName,
                    version,
                    type,
                  })
                }
              }
            }
          }
        }
      }
    } catch {
      // 忽略解析错误
    }
  }

  return Array.from(catalogDeps.values())
}

/**
 * 打印静态资源分析结果
 */
function printAssetsResults(projects: ProjectAssets[]): void {

  if (projects.length === 0) {
    return
  }

  let totalSize = 0
  let totalFiles = 0

  for (const project of projects) {
    totalSize += project.totalSize
    totalFiles += project.assets.length
  }


  for (const project of projects) {

    // 按类型统计
    const typeStats = new Map<string, { count: number; size: number }>()
    for (const asset of project.assets) {
      const stats = typeStats.get(asset.type) || { count: 0, size: 0 }
      stats.count++
      stats.size += asset.size
      typeStats.set(asset.type, stats)
    }

    if (typeStats.size > 0) {
      const sortedTypes = Array.from(typeStats.entries()).sort((a, b) => b[1].size - a[1].size)
      for (const [type, stats] of sortedTypes) {
      }
    }

    // 显示最大的几个文件
    if (project.assets.length > 0) {
      const topAssets = [...project.assets].sort((a, b) => b.size - a.size).slice(0, 5)
      for (const asset of topAssets) {
      }
    }
  }

}

/**
 * 打印版本规范分析结果
 */
function printVersionsResults(issues: VersionIssue[]): void {

  if (issues.length === 0) {
    return
  }


  // 按项目分组
  const issuesByProject = new Map<string, VersionIssue[]>()
  for (const issue of issues) {
    const key = issue.projectPath
    const projectIssues = issuesByProject.get(key) || []
    projectIssues.push(issue)
    issuesByProject.set(key, projectIssues)
  }

  for (const [projectPath, projectIssues] of issuesByProject.entries()) {

    for (const issue of projectIssues) {
    }
  }

}

/**
 * 打印 catalog 依赖分析结果
 */
function printCatalogDepsResults(catalogDeps: CatalogDependency[]): void {

  // 过滤出有使用记录的依赖
  const usedDeps = catalogDeps.filter((dep) => dep.usedIn.length > 0)
  const unusedDeps = catalogDeps.filter((dep) => dep.usedIn.length === 0)


  if (usedDeps.length > 0) {

    for (const dep of usedDeps.sort((a, b) => b.usedIn.length - a.usedIn.length)) {

      // 按项目分组
      const byProject = new Map<string, typeof dep.usedIn>()
      for (const usage of dep.usedIn) {
        const key = usage.projectPath
        const usages = byProject.get(key) || []
        usages.push(usage)
        byProject.set(key, usages)
      }

      for (const [projectPath, usages] of byProject.entries()) {
        const projectName = usages[0].projectName
        const types = usages.map((u) => u.type).join(', ')
      }
    }
  }

  if (unusedDeps.length > 0) {
    for (const dep of unusedDeps) {
    }
  }

}

/**
 * 分析文件类型统计
 */
function analyzeFileTypes(rootDir: string, sortBy: 'count' | 'size' = 'count'): ProjectFileTypes[] {

  const packageFiles = findPackageJsonFiles(rootDir).filter(
    (file) => !file.includes('/node_modules/') && !file.includes('\\node_modules\\')
  )

  const projects: ProjectFileTypes[] = []

  for (const pkgFile of packageFiles) {
    try {
      const content = readFileSync(pkgFile, 'utf-8')
      const pkg: PackageJson = JSON.parse(content)
      const projectDir = pkgFile.replace('/package.json', '').replace('\\package.json', '')
      const projectName = pkg.name || projectDir.split(/[/\\]/).pop() || 'unknown'

      // 跳过根目录的 package.json
      if (projectDir === rootDir || projectDir === rootDir.replace(/\/$/, '')) {
        continue
      }

      const fileStats = findAndStatFiles(projectDir, projectDir)
      const fileTypes: FileTypeStats[] = Array.from(fileStats.entries())
        .map(([extension, stats]) => ({
          extension,
          count: stats.count,
          totalSize: stats.totalSize,
        }))

      // 根据排序规则排序
      if (sortBy === 'count') {
        fileTypes.sort((a, b) => b.count - a.count)
      } else {
        fileTypes.sort((a, b) => b.totalSize - a.totalSize)
      }

      const totalFiles = fileTypes.reduce((sum, ft) => sum + ft.count, 0)
      const totalSize = fileTypes.reduce((sum, ft) => sum + ft.totalSize, 0)

      if (fileTypes.length > 0) {
        projects.push({
          projectPath: relative(rootDir, projectDir),
          projectName,
          fileTypes,
          totalFiles,
          totalSize,
        })
      }
    } catch {
      // 忽略解析错误
    }
  }

  // 按总大小排序
  projects.sort((a, b) => b.totalSize - a.totalSize)

  return projects
}

/**
 * 打印文件类型统计结果
 */
function printFileTypesResults(projects: ProjectFileTypes[], sortBy: 'count' | 'size' = 'count'): void {

  if (projects.length === 0) {
    return
  }

  let totalFiles = 0
  let totalSize = 0

  for (const project of projects) {
    totalFiles += project.totalFiles
    totalSize += project.totalSize
  }


  for (const project of projects) {

    // 显示前 20 种文件类型
    const topTypes = project.fileTypes.slice(0, 20)
    for (const fileType of topTypes) {
      const percentage = ((fileType.totalSize / project.totalSize) * 100).toFixed(2)
    }

    if (project.fileTypes.length > 20) {
    }
  }

}

/**
 * 分析 Git 贡献者代码行数
 */
function analyzeContributors(rootDir: string, ignorePatterns: string[] = []): ProjectContributors[] {

  const packageFiles = findPackageJsonFiles(rootDir).filter(
    (file) => !file.includes('/node_modules/') && !file.includes('\\node_modules\\')
  )

  const projects: ProjectContributors[] = []

  for (const pkgFile of packageFiles) {
    try {
      const content = readFileSync(pkgFile, 'utf-8')
      const pkg: PackageJson = JSON.parse(content)
      const projectDir = pkgFile.replace('/package.json', '').replace('\\package.json', '')
      const projectName = pkg.name || projectDir.split(/[/\\]/).pop() || 'unknown'

      // 跳过根目录的 package.json
      if (projectDir === rootDir || projectDir === rootDir.replace(/\/$/, '')) {
        continue
      }

      try {
        // 使用 git shortlog 获取贡献者统计
        // git shortlog -sn -- . 会统计当前目录下的所有提交
        const gitDir = join(rootDir, '.git')
        const gitDirExists = (() => {
          try {
            return statSync(gitDir).isDirectory()
          } catch {
            return false
          }
        })()

        if (!gitDirExists) {
          continue
        }

        // 获取该项目的相对路径
        const relativeProjectPath = relative(rootDir, projectDir)

        // 使用 git log --numstat 统计代码行数
        // 格式：每行一个 commit，包含作者和 commit hash，然后是文件统计
        const gitLogCmd = `git log --pretty=format:"%an|%H" --numstat -- "${relativeProjectPath}" 2>/dev/null || true`
        let gitOutput = ''
        try {
          gitOutput = execSync(gitLogCmd, {
            cwd: rootDir,
            encoding: 'utf-8',
            maxBuffer: 10 * 1024 * 1024, // 10MB
          })
        } catch {
          // 如果 git 命令失败，跳过这个项目
          continue
        }

        // 解析 git log 输出
        const lines = gitOutput.split('\n')
        const contributorMap = new Map<
          string,
          {
            lines: number
            commits: Set<string>
            files?: Map<string, { lines: number; commits: Set<string> }>
          }
        >()

        let currentAuthor = ''
        let currentCommit = ''

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()

          // 如果是作者和 commit hash 行（格式：作者名|commit-hash）
          if (line && line.includes('|')) {
            const parts = line.split('|')
            if (parts.length >= 2) {
              currentAuthor = parts[0]
              currentCommit = parts[1]
              if (!contributorMap.has(currentAuthor)) {
                contributorMap.set(currentAuthor, { lines: 0, commits: new Set(), files: new Map() })
              }
              // 记录 commit
              const contributor = contributorMap.get(currentAuthor)
              if (contributor) {
                contributor.commits.add(currentCommit)
              }
            }
          } else if (line && line.includes('\t') && currentAuthor) {
            // 解析文件统计行：添加行数 删除行数 文件名
            const parts = line.split('\t')
            if (parts.length >= 3) {
              const added = parseInt(parts[0], 10) || 0
              const deleted = parseInt(parts[1], 10) || 0
              let filename = parts[2] || ''
              
              // 检查是否应该忽略该文件
              // 文件路径可能是相对于项目目录的，需要构建完整路径
              const fullFilePath = filename.startsWith('/')
                ? join(rootDir, filename)
                : join(projectDir, filename)
              
              if (ignorePatterns.length > 0 && shouldIgnoreFile(fullFilePath, ignorePatterns, rootDir)) {
                continue
              }

              // 使用净增行数（添加 - 删除），只统计净增的代码
              const netLines = added - deleted

              const contributor = contributorMap.get(currentAuthor)
              if (contributor && netLines > 0) {
                contributor.lines += netLines
                
                // 存储文件信息用于语言类型统计和提交频次统计
                if (contributor.files) {
                  const fileInfo = contributor.files.get(filename) || { lines: 0, commits: new Set() }
                  fileInfo.lines += netLines
                  fileInfo.commits.add(currentCommit)
                  contributor.files.set(filename, fileInfo)
                }
              }
            }
          }
        }

        // 转换为数组格式
        const contributors: ContributorStats[] = Array.from(contributorMap.entries())
          .map(([author, stats]) => ({
            author,
            lines: stats.lines,
            commits: stats.commits.size,
            files: stats.files
              ? Array.from(stats.files.entries()).map(([filename, fileInfo]) => ({
                  filename,
                  lines: fileInfo.lines,
                  commits: fileInfo.commits.size,
                }))
              : [],
          }))
          .filter((c) => c.lines > 0) // 只保留有代码贡献的
          .sort((a, b) => b.lines - a.lines)

        const totalLines = contributors.reduce((sum, c) => sum + c.lines, 0)
        const totalCommits = contributors.reduce((sum, c) => sum + c.commits, 0)

        if (contributors.length > 0) {
          projects.push({
            projectPath: relativeProjectPath,
            projectName,
            contributors,
            totalLines,
            totalCommits,
          })
        }
      } catch {
        // 忽略 git 相关错误
      }
    } catch {
      // 忽略解析错误
    }
  }

  // 按总代码行数排序
  projects.sort((a, b) => b.totalLines - a.totalLines)

  return projects
}

/**
 * 打印 Git 贡献者统计结果
 */
function printContributorsResults(projects: ProjectContributors[]): void {

  if (projects.length === 0) {
    return
  }

  let totalLines = 0
  let totalCommits = 0

  for (const project of projects) {
    totalLines += project.totalLines
    totalCommits += project.totalCommits
  }


  for (const project of projects) {

    // 显示前 10 名贡献者
    const topContributors = project.contributors.slice(0, 10)
    for (const contributor of topContributors) {
      const percentage = ((contributor.lines / project.totalLines) * 100).toFixed(2)
    }

    if (project.contributors.length > 10) {
    }
  }

}

/**
 * 生成 Git 贡献者汇总统计（按个人和语言类型）
 */
function generateContributorsSummary(
  projects: ProjectContributors[],
  topFilesSortBy: 'lines' | 'commits' = 'lines'
): ContributorSummary[] {
  const summaryMap = new Map<
    string,
    {
      totalLines: number
      totalCommits: number
      languages: Map<string, number>
      files: Map<string, { commits: number; lines: number }>
    }
  >()

  // 汇总所有项目的贡献者数据
  for (const project of projects) {
    for (const contributor of project.contributors) {
      if (!summaryMap.has(contributor.author)) {
        summaryMap.set(contributor.author, {
          totalLines: 0,
          totalCommits: 0,
          languages: new Map(),
          files: new Map(),
        })
      }

      const summary = summaryMap.get(contributor.author)!
      summary.totalLines += contributor.lines
      summary.totalCommits += contributor.commits

      // 如果有文件信息，按语言类型统计和文件提交频次统计
      if (contributor.files) {
        for (const file of contributor.files) {
          // 语言类型统计
          const language = getLanguageFromFilename(file.filename)
          const currentLines = summary.languages.get(language) || 0
          summary.languages.set(language, currentLines + file.lines)

          // 文件提交频次统计（合并相同文件路径）
          const fileKey = file.filename
          const fileInfo = summary.files.get(fileKey) || { commits: 0, lines: 0 }
          fileInfo.commits += file.commits
          fileInfo.lines += file.lines
          summary.files.set(fileKey, fileInfo)
        }
      }
    }
  }

  // 转换为数组格式
  const summaries: ContributorSummary[] = Array.from(summaryMap.entries())
    .map(([author, stats]) => {
      // 获取 TOP 10 文件（按指定方式排序）
      const topFiles = Array.from(stats.files.entries())
        .map(([filename, fileInfo]) => ({
          filename,
          commits: fileInfo.commits,
          lines: fileInfo.lines,
        }))
        .sort((a, b) => {
          if (topFilesSortBy === 'commits') {
            return b.commits - a.commits
          }
          // 默认按代码行数排序
          return b.lines - a.lines
        })
        .slice(0, 10)

      return {
        author,
        totalLines: stats.totalLines,
        totalCommits: stats.totalCommits,
        languages: Array.from(stats.languages.entries())
          .map(([language, lines]) => ({ language, lines }))
          .sort((a, b) => b.lines - a.lines),
        topFiles,
      }
    })
    .sort((a, b) => b.totalLines - a.totalLines)

  return summaries
}

/**
 * 打印 Git 贡献者汇总统计结果
 */
function printContributorsSummaryResults(
  summaries: ContributorSummary[],
  topFilesSortBy: 'lines' | 'commits' = 'lines'
): void {

  if (summaries.length === 0) {
    return
  }

  const totalLines = summaries.reduce((sum, s) => sum + s.totalLines, 0)
  const totalCommits = summaries.reduce((sum, s) => sum + s.totalCommits, 0)


  for (const summary of summaries) {
    const percentage = ((summary.totalLines / totalLines) * 100).toFixed(2)

    if (summary.languages.length > 0) {
      for (const lang of summary.languages) {
        const langPercentage = ((lang.lines / summary.totalLines) * 100).toFixed(2)
      }
    }

    if (summary.topFiles.length > 0) {
      const sortLabel = topFilesSortBy === 'commits' ? '提交次数' : '代码行数'
      for (const file of summary.topFiles) {
      }
    }
  }

}

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    process.exit(0)
  }

  const rootDir = process.cwd()
  const runAll = args.length === 0 || args.includes('--all')
  const runAssets = runAll || args.includes('--assets')
  const runVersions = runAll || args.includes('--versions')
  const runCatalogDeps = runAll || args.includes('--catalog-deps')
  const runFileTypes = runAll || args.includes('--file-types')
  const runContributors = runAll || args.includes('--contributors')
  const runContributorsSummary = args.includes('--contributors-summary')

  // 解析文件类型排序参数
  let fileTypesSort: 'count' | 'size' = 'count'
  const sortByIndex = args.indexOf('--file-types-sort')
  if (sortByIndex >= 0 && sortByIndex + 1 < args.length) {
    const sortValue = args[sortByIndex + 1]
    if (sortValue === 'count' || sortValue === 'size') {
      fileTypesSort = sortValue
    }
  }

  // 解析忽略文件配置
  let ignorePatterns: string[] = []
  const ignoreFileIndex = args.indexOf('--ignore-file')
  if (ignoreFileIndex >= 0 && ignoreFileIndex + 1 < args.length) {
    const ignoreFilePath = args[ignoreFileIndex + 1]
    try {
      const fullPath = join(rootDir, ignoreFilePath)
      ignorePatterns = parseGitignore(fullPath, rootDir)
    } catch (error) {
    }
  }

  // 如果指定了 --use-gitignore，自动加载 .gitignore
  if (args.includes('--use-gitignore')) {
    const gitignorePath = join(rootDir, '.gitignore')
    try {
      const patterns = parseGitignore(gitignorePath, rootDir)
      ignorePatterns.push(...patterns)
    } catch {
      // .gitignore 不存在或无法读取，忽略
    }
  }

  // 解析 TOP 10 文件排序参数
  let topFilesSortBy: 'lines' | 'commits' = 'lines'
  const topFilesSortIndex = args.indexOf('--top-files-sort')
  if (topFilesSortIndex >= 0 && topFilesSortIndex + 1 < args.length) {
    const sortValue = args[topFilesSortIndex + 1]
    if (sortValue === 'commits' || sortValue === 'lines') {
      topFilesSortBy = sortValue
    }
  }

  if (runAssets) {
    const projects = analyzeAssets(rootDir)
    printAssetsResults(projects)
  }

  if (runVersions) {
    const issues = analyzeVersions(rootDir)
    printVersionsResults(issues)
  }

  if (runCatalogDeps) {
    const catalogDeps = analyzeCatalogDependencies(rootDir)
    printCatalogDepsResults(catalogDeps)
  }

  if (runFileTypes) {
    const projects = analyzeFileTypes(rootDir, fileTypesSort)
    printFileTypesResults(projects, fileTypesSort)
  }

  if (runContributors) {
    const projects = analyzeContributors(rootDir, ignorePatterns)
    printContributorsResults(projects)
  }

  if (runContributorsSummary) {
    const projects = analyzeContributors(rootDir, ignorePatterns)
    const summaries = generateContributorsSummary(projects, topFilesSortBy)
    printContributorsSummaryResults(summaries, topFilesSortBy)
  }
}

main().catch((error) => {
  process.exit(1)
})
