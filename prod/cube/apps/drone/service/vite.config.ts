import path from 'node:path'
import { defineConfig } from 'vite'
import { deepEntries } from '@ghcloud/vite-utils/lib/module'
import dtsPlugin from 'vite-plugin-dts'

export default defineConfig(() => {
  return {
    plugins: [dtsPlugin()],
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: 'chunks/[name].js',
        },
      },
      lib: {
        entry: deepEntries(path.resolve(__dirname, './src')),
        formats: ['es'],
        fileName: (_format, entryName) => {
          return `${entryName}.js`
        },
      },
      outDir: path.resolve(__dirname, './lib'),
    },
    resolve: {
      alias: {
        '@ghcloud/cube-drone-service': path.resolve(__dirname, './src'),
      },
    },
  }
})
