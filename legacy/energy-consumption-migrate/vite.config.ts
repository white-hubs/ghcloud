import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import unpluginVueComponent from 'unplugin-vue-components/vite'
import vueMacros from 'unplugin-vue-macros/vite'
import { defineConfig } from 'vite'
import qiankun from 'vite-plugin-qiankun'
import { AntDesignVue3Resolver } from './vite-plugin/unplugin-vue-components/antdv3/resolver'
import { createHtmlPlugin } from 'vite-plugin-html'
import { version } from './package.json'
const projectName = 'energy'
export default defineConfig(({ mode }) => {
  const publicPath = '/apps-legacy/energy-consumption-migrate'
  return {
    plugins: [
      vueMacros({
        plugins: {
          vue: vue(),
          vueJsx: vueJsx(),
        }
      }),
      createHtmlPlugin({
        inject: {
          data: {
            version
          }
        }
      }),
      unpluginVueComponent({
        dts: true,
        resolvers: [
          AntDesignVue3Resolver({
            resolveIcons: true,
            importStyle: false, // ant-design-vue 4.x 使用 CSS-in-JS，无需按需引入样式
            cjs: false
          })
        ]
      }),
      qiankun(projectName, {
        useDevMode: true,
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: [
            '@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";',
          ],
          modifyVars: {
            '@cube-ui-prefix': projectName,
            '@ant-prefix': projectName,
            '@root-entry-name': 'variable',
            '@cube-theme-antd3-prefix': projectName,
            '@cube-theme-antd3-scope-selector': '#Energy'
          },
          javascriptEnabled: true
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[hash].js',
          assetFileNames: 'assets/[hash].[ext]',
          entryFileNames: 'assets/[hash].js',
        }
      }
    },
    base: publicPath,
    server: {
      https: false,
      host: '0.0.0.0',
      origin: 'http://localhost:8888',
      port: 8888,
    }
  }
})
