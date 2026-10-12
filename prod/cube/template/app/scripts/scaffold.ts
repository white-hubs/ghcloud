#!/usr/bin/env bun
/**
 * 模板脚手架。从 `prod/cube/template/app` 复制一份到 `prod/cube/apps/<slug>/app`，
 * 并把所有占位符替换为新应用的标识。
 *
 * 用法：
 *   bun run scaffold                     # 交互式
 *   bun run scaffold --slug=foo-bar      # 命令行参数模式
 *
 * 占位符（可在 `PLACEHOLDERS` 中扩展）：
 *   - template-app          → <slug>                             (路径/项目名)
 *   - TemplateApp           → <PascalName>                       (DOM id / Vue name)
 *   - TEMPLATE_APP          → <UPPER_SNAKE>                      (applicationCode)
 *   - cube-template-app     → cube-<slug>-app                    (package.json.name)
 *   - 模板应用              → <中文名>                           (title / readme)
 *
 * 替换范围：除 `node_modules/` `dist/` 和本脚本自身外的所有文本文件。
 */

import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

interface Answers {
  slug: string;
  zhName: string;
  targetDir: string;
}

const IGNORED_DIRS = new Set(['node_modules', 'dist', '.git', 'scripts'])
const BINARY_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot'])

const toPascal = (slug: string): string => slug
  .split(/[^a-zA-Z0-9]/)
  .filter(Boolean)
  .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase())
  .join('')

const toUpperSnake = (slug: string): string => slug
  .split(/[^a-zA-Z0-9]/)
  .filter(Boolean)
  .map((seg) => seg.toUpperCase())
  .join('_')

const parseArgs = (): Partial<Answers> => {
  const args = process.argv.slice(2)
  const result: Partial<Answers> = {}
  for (const arg of args) {
    const match = /^--(\w[\w-]*)=(.*)$/.exec(arg)
    if (!match) {
      continue
    }
    const [, key, value] = match
    if (key === 'slug' || key === 'zhName' || key === 'targetDir') {
      result[key] = value
    }
  }
  return result
}

const prompt = async (cliArgs: Partial<Answers>): Promise<Answers> => {
  const rl = readline.createInterface({ input, output })
  try {
    const slug = cliArgs.slug ?? (await rl.question('应用 slug（kebab-case，如 alarm-center）：')).trim()
    if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
      throw new Error(`无效的 slug: "${slug}"；要求 kebab-case 且以字母开头`)
    }
    const zhNameInput = cliArgs.zhName ?? (await rl.question('中文名（如 报警中心）：')).trim()
    const zhName = zhNameInput || '新应用'
    const defaultTarget = path.resolve(process.cwd(), '../../apps', slug, 'app')
    const targetInput = cliArgs.targetDir ?? (await rl.question(`目标目录（默认：${defaultTarget}）：`)).trim()
    const targetDir = targetInput || defaultTarget
    return { slug, zhName, targetDir }
  } finally {
    rl.close()
  }
}

const buildPlaceholders = (answers: Answers): Array<[RegExp, string]> => {
  const pascal = toPascal(answers.slug)
  const upperSnake = toUpperSnake(answers.slug)
  // 顺序关键：长串先替换，避免 `template-app` 先把 `cube-template-app` 吃掉
  return [
    [/cube-template-app/g, `cube-${answers.slug}-app`],
    [/TEMPLATE_APP/g, upperSnake],
    [/TemplateApp/g, pascal],
    [/template-app/g, answers.slug],
    [/模板应用/g, answers.zhName],
  ]
}

const copyTree = (src: string, dest: string): void => {
  const entries = fs.readdirSync(src, { withFileTypes: true })
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) {
      continue
    }
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyTree(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

const walkFiles = (dir: string, cb: (file: string) => void): void => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkFiles(full, cb)
    } else {
      cb(full)
    }
  }
}

const applyPlaceholders = (targetDir: string, replacements: Array<[RegExp, string]>): void => {
  walkFiles(targetDir, (file) => {
    if (BINARY_EXTS.has(path.extname(file).toLowerCase())) {
      return
    }
    const content = fs.readFileSync(file, 'utf-8')
    const next = replacements.reduce((acc, [pattern, val]) => acc.replace(pattern, val), content)
    if (next !== content) {
      fs.writeFileSync(file, next, 'utf-8')
    }
  })
}

const main = async (): Promise<void> => {
  const here = path.dirname(new URL(import.meta.url).pathname)
  const templateRoot = path.resolve(here, '..')

  const cliArgs = parseArgs()
  const answers = await prompt(cliArgs)

  if (fs.existsSync(answers.targetDir)) {
    throw new Error(`目标目录已存在：${answers.targetDir}`)
  }

  console.log(`\n[scaffold] 从 ${templateRoot} 复制到 ${answers.targetDir}`)
  copyTree(templateRoot, answers.targetDir)

  console.log('[scaffold] 应用占位符替换')
  applyPlaceholders(answers.targetDir, buildPlaceholders(answers))

  console.log('\n✅ 脚手架完成。下一步：')
  console.log(`  1. cd ${answers.targetDir}`)
  console.log('  2. 根据业务修改 src/router/index.ts 和 src/views/')
  console.log('  3. 补全 src/mocks/*.mock.ts，或关闭 VITE_USE_MOCK 接入真实 BFF')
  console.log('  4. bun install && bun run dev\n')
}

main().catch((err: Error) => {
  console.error('[scaffold] 失败：', err.message)
  process.exit(1)
})
