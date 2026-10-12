import path from 'node:path'
import { defineConfig } from 'vite'
import dtsPlugin from 'vite-plugin-dts'
import { deepEntries } from '@ghcloud/vite-utils/lib/module'

export default defineConfig(() => {
  return {
    plugins: [
      dtsPlugin(),
    ],
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: 'chunks/[name].js',
        },
      },
      lib: {
        entry: deepEntries(path.resolve(__dirname, './src')),
        formats: ['es', 'cjs'],
        fileName: (format, entryName) => {
          return `${entryName}.${format}.js`
        }
      },
      outDir: path.resolve(__dirname, './lib'),
    },
    resolve: {
      alias: {
        '@ghcloud/logger': path.resolve(__dirname, './src'),
      },
    },
  }
})
