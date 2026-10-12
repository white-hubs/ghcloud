import type { MarkdownEnv, MarkdownRenderer } from 'vitepress'

import crypto from 'node:crypto'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export const rawPathRegexp = /^(.+?(?:\.([\da-z]+))?)(#[\w-]+)?(?: ?{(\d+(?:[,-]\d+)*)? ?(\S+)?})? ?(?:\[(.+)])?$/

function rawPathToToken (rawPath: string): {
  extension: string;
  filepath: string;
  lang: string;
  lines: string;
  region: string;
  title: string;
} {
  const [
    filepath = '',
    extension = '',
    region = '',
    lines = '',
    lang = '',
    rawTitle = '',
  ] = (rawPathRegexp.exec(rawPath) || []).slice(1)

  const title = rawTitle || filepath.split('/').pop() || ''

  return { extension, filepath, lang, lines, region, title }
}

export const demoPreviewPlugin = (md: MarkdownRenderer): void => {
  md.core.ruler.after('inline', 'demo-preview', (state) => {
    const insertComponentImport = (importString: string): void => {
      const index = state.tokens.findIndex(
        (i) => i.type === 'html_block' && i.content.match(/<script setup>/g),
      )
      if (index === -1) {
        const importComponent = new state.Token('html_block', '', 0)
        importComponent.content = `<script setup>\n${importString}\n</script>\n`
        state.tokens.splice(0, 0, importComponent)
      } else {
        if (state.tokens[index]) {
          const content = state.tokens[index].content
          state.tokens[index].content = content.replace(
            '</script>',
            `${importString}\n</script>`,
          )
        }
      }
    }
    // Define the regular expression to match the desired pattern
    const regex = /<DemoPreview[^>]*\sfile="([^"]*)"/g
    state.src = state.src.replaceAll(regex, (match, dir) => {
      const filePath = join(process.cwd(), 'code', dir).replaceAll(
        '\\',
        '/',
      )

      const filename = filePath.split('/')[filePath.split('/').length - 1]

      if (!filePath || !existsSync(filePath)) {
        return ''
      }

      const uniqueWord = generateContentHash(filePath)
      const ComponentName = `DemoComponent_${uniqueWord}`
      insertComponentImport(
        `import ${ComponentName} from '${filePath}'`,
      )
      const { path: _path } = state.env as MarkdownEnv

      const index = state.tokens.findIndex((i) => i.content.match(regex))

      if (!state.tokens[index]) {
        return ''
      }
      state.tokens[index].content = `<DemoPreview file="${filename}"><${ComponentName}/>`

      const dummyToken = new state.Token('', '', 0)
      const tokenArray: typeof dummyToken[] = []

      const templateStart = new state.Token('html_inline', '', 0)
      templateStart.content = `<template #${filename}>`
      tokenArray.push(templateStart)

      const { extension, filepath, lang, lines, title } = rawPathToToken(filePath)
      // Add code tokens for each line
      const token = new state.Token('fence', 'code', 0)
      token.info = `${lang || extension}${lines ? `{${lines}}` : ''}${
        title ? `[${title}]` : ''
      }`

      token.content = `<<< ${filepath}`;
      (token as any).src = [filePath]
      tokenArray.push(token)

      const templateEnd = new state.Token('html_inline', '', 0)
      templateEnd.content = '</template>'
      tokenArray.push(templateEnd)
      const endTag = new state.Token('html_inline', '', 0)
      endTag.content = '</DemoPreview>'
      tokenArray.push(endTag)

      state.tokens.splice(index + 1, 0, ...tokenArray)
      return ''
    })
  })
}

function generateContentHash (input: string, length: number = 10): string {
  // 使用 SHA-256 生成哈希值
  const hash = crypto.createHash('sha256').update(input).digest('hex')

  // 将哈希值转换为 Base36 编码，并取指定长度的字符作为结果
  return Number.parseInt(hash, 16).toString(36).slice(0, length)
}
