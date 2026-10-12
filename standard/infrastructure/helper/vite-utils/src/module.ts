import fs from 'fs'
import path from 'path'

/**
 * 扫描入口文件对应路径
 *
 * @param dirPath 扫描的入口路径
 * @param extensionsRe 扩展名正则, 默认 .ts
 * @returns 入口文件映射
 */
export function deepEntries (dirPath: string, extensionsRe = /\.ts$/): Record<string, string> {
  const entries: Record<string, string> = {}
  const files = deepFiles(dirPath)
    .filter(file => extensionsRe.test(file))
  files.forEach(file => {
    const aliasName = file
      .replace(dirPath, '')
      .replace(/^(\/|\\)/, '')
      .replace(extensionsRe, '')
    entries[aliasName] = file
  })
  return entries
}

export function deepFiles (dirPath: string): string[] {
  if (fs.statSync(dirPath).isFile()) {
    return [dirPath]
  }
  const result: string[] = []
  const files = fs.readdirSync(dirPath)
  files.forEach(file => {
    result.push(...deepFiles(path.resolve(dirPath, file)))
  })
  return result
}
