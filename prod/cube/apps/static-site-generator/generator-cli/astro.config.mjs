import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const inputDir = process.env.SSG_INPUT_DIR || './site'

const fontSrcDir = resolve(__dirname, 'assets/fonts')
const fontDestDir = resolve(__dirname, 'dist/assets')
const fontExtensions = ['.otf', '.ttf', '.woff', '.woff2']

function copyFontPlugin() {
  return {
    name: 'copy-font-plugin',
    apply: 'build',
    closeBundle() {
      if (!existsSync(fontSrcDir)) { return }
      const files = readdirSync(fontSrcDir)
      const fontFiles = files.filter(f => fontExtensions.some(ext => f.toLowerCase().endsWith(ext)))
      if (fontFiles.length === 0) { return }
      if (!existsSync(fontDestDir)) {
        mkdirSync(fontDestDir, { recursive: true })
      }
      for (const fontFile of fontFiles) {
        const fontSrc = resolve(fontSrcDir, fontFile)
        copyFileSync(fontSrc, resolve(fontDestDir, fontFile))
        // oxlint-disable-next-line no-console
      }
    },
  }
}

export default defineConfig({
  integrations: [vue()],
  output: 'static',
  publicDir: `${inputDir}/public`,
  build: {
    format: 'file',
    assets: 'assets',
  },
  vite: {
    plugins: [copyFontPlugin()],
    resolve: {
      alias: {
        '@ghcloud/cube-static-site-generator-components': resolve(__dirname, '../ssg-components/src'),
        '~components': resolve(__dirname, '../ssg-components/src'),
      },
    },
    build: {
      cssMinify: false,
      minify: false,
    },
  },
})
