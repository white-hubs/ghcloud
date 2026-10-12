import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dts({
      insertTypesEntry: true,
      copyDtsFiles: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'GraphEditorElectrical',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', '@antv/x6', 'pinia', 'ant-design-vue', '@ghcloud/cube-graph-editor-core'],
      output: {
        globals: {
          vue: 'Vue',
          '@antv/x6': 'X6',
          pinia: 'Pinia',
          'ant-design-vue': 'AntDesignVue',
          '@ghcloud/cube-graph-editor-core': 'GraphEditorCore',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@ghcloud/cube-graph-editor-core': path.resolve(__dirname, '../cube-graph-editor-core/src'),
    },
  },
})
