import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import unpluginVueComponent from 'unplugin-vue-components/vite'
import vueMacros from 'unplugin-vue-macros/dist/vite'
import { defineConfig, loadEnv } from 'vite'
import qiankun from 'vite-plugin-qiankun'
import pkg from './package.json'
import { antDesignVue3Resolver } from './vite-plugin/unplugin-vue-components/antdv3/resolver'
import Unocss from 'unocss/vite'
import { presetUno, presetAttributify, presetIcons } from 'unocss'
import { createHtmlPlugin } from 'vite-plugin-html'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicPath = env.PUBLIC_PATH ?? '/'
  const projectName = 'asset-management'

  return {
    plugins: [
      vueMacros({
        plugins: {
          vue: vue(),
          vueJsx: vueJsx()
        }
      }),
      createHtmlPlugin({
        inject: {
          data: {
            version:pkg.version
          }
        }
      }),
      unpluginVueComponent({
        dts: true,
        resolvers: [
          antDesignVue3Resolver({
            resolveIcons: true,
            importStyle: false, // ant-design-vue 4.x 使用 CSS-in-JS，无需按需引入样式
            cjs: false
          })
        ]
      }),
      qiankun(projectName, {
        useDevMode: true,
      }),
      Unocss({ // 使用Unocss
        presets: [
          presetUno(),
          presetAttributify(),
          presetIcons()],
      })
    ],
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[hash].js',
          assetFileNames: 'assets/[hash].[ext]',
          entryFileNames: 'assets/[hash].js',
        }
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          additionalData: [
            '@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";',
          ],
          modifyVars: {
            '@ant-prefix': projectName,
            '@root-entry-name': 'variable',
            '@cube-theme-antd3-prefix': projectName,
            '@cube-theme-antd3-scope-selector': '#LegacyAssetManagementApp'
          },
          javascriptEnabled: true
        }
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    base: publicPath,
    server: {
      host: '0.0.0.0',
      origin: '//localhost:8888',
      port: 8888,
      headers: {
        'Accsee-Control-Allow-Origin': '*',
      },
      open: false,
      hmr: true,
    },
    preview: {
      port: 5050,
    },
    define:{
      __ENV__:{
        applicationCode: 'PROPERTY_MANAGEMENT' 
      }
    }
  }
})
