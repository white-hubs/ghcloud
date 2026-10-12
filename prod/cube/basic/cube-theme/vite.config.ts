import path from 'node:path'
import { deepEntries } from '@ghcloud/vite-utils/lib/module'
import { defineConfig } from 'vite'
export default defineConfig(() => {
  return {
    plugins: [
    ],
    build: {
      lib: {
        entry: deepEntries(path.resolve(__dirname, './src')),
        name: 'main',
        formats: ['es'],
      },
      outDir: path.resolve(__dirname, './lib'),
      target: 'es2015'
    },
    resolve: {
      alias: {
        '@ghcloud/cube-theme': path.resolve(__dirname, './src'),
      },
    },
  }
})
