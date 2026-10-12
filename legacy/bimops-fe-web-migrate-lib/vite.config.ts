import path from 'node:path'
import { deepEntries } from '@ghcloud/vite-utils/lib/module'
import { LibraryFormats, defineConfig } from 'vite'
import pugPlugin from 'vue-pug-plugin'
import vuePlugin from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
export default defineConfig(() => {
  return {
    plugins: [
      vueJsx(),
      vuePlugin({
        template: {
          preprocessOptions: {
            plugins: [
              pugPlugin
            ]
          }
        }
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: [
            `@import "${path.resolve(__dirname, 'src/styles/index.less')}";`,
          ],
          modifyVars: {
            
          },
          // 开启 less js 支持以解决 antdv3 less 样式编译问题
          javascriptEnabled: true
        }
      }
    },
    build: {
      lib: {
        entry: deepEntries(path.resolve(__dirname, './src'), /\.(js|vue)$/),
        name: 'main',
        formats: ['es'] as LibraryFormats[],
      },
      outDir: path.resolve(__dirname, './lib'),
      target: 'es2015',
      rollupOptions: {
        output: {
          chunkFileNames: 'vendor/vendor.js'
        },
        external: ['vue', 'vue-router', 'vuex', 'ant-design-vue', '@ant-design/icons-vue', 'diagram-js', 'moment', 'moment/dist/locale/zh-cn', 'ant-design-vue/es/locale-provider/zh_CN']
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        "~@": path.resolve(__dirname, "./src"),
        "~basscss": path.resolve(__dirname, "./node_modules/basscss"),
      },
      extensions: ['.js', '.ts','.vue', '.json','.tsx']
    },
  }
})
