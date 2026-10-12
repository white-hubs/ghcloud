import path from 'node:path'
import { defineConfig } from 'vite'
import dtsPlugin from 'vite-plugin-dts'
import vue from '@vitejs/plugin-vue';
import { deepEntries } from '@ghcloud/vite-utils/lib/module'

export default defineConfig(() => {
  return {
    plugins: [
      vue(),
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
        formats: ['es'],
        fileName: (format, entryName) => {
          return `${entryName}.js`
        }
      },
      outDir: path.resolve(__dirname, './lib'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
