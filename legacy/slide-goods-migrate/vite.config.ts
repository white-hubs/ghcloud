import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from 'vite'
import qiankun from 'vite-plugin-qiankun'
import pugPlugin from 'vue-pug-plugin'
import vuePlugin from '@vitejs/plugin-vue'
import pkg from './package.json'
import { generateColor } from './color'
import { createHtmlPlugin } from 'vite-plugin-html'
await generateColor()
const config = await defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicPath = env.PUBLIC_PATH ?? '/'
  const projectName = pkg.name.replace('@ghcloud-legacy/', '')
  const containerId = `#${env.VITE_CONTAINER_ID}`

  return {
    plugins: [
      vuePlugin({
        template: {
          preprocessOptions: {
            plugins: [
              pugPlugin
            ]
          }
        }
      }),
      createHtmlPlugin({
        inject: {
          data: {
            version:pkg.version
          }
        }
      }),
      vueJsx(),
      qiankun(projectName, {
        useDevMode: true,
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: [
            `@import url('@/styles/theme/color.less');`
          ],
          modifyVars: {
            // '@ant-prefix': projectName,
            // '@root-entry-name': 'variable',
            // '@cube-theme-antd3-prefix': projectName,
            // '@cube-theme-antd3-scope-selector': containerId
          },
          javascriptEnabled: true
        }
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        "~basscss": path.resolve(__dirname, "./node_modules/basscss"),
      },
    },
    base: publicPath,
    define: {
      /**
       * > String 值会以原始表达式形式使用，所以如果定义了一个字符串常量，它需要被显式地打引号。（例如使用 `JSON.stringify`）
       * 
       * [参考](https://cn.vitejs.dev/config/shared-options.html#define)
       */
      __CONTAINER_ID__: JSON.stringify(containerId),
      __PUBLIC_PATH__: JSON.stringify(publicPath),
    }
  }
})

export async function getBaseConfig (env: ConfigEnv): Promise<UserConfig> {
  if (typeof config === 'function') {
    return config(env)
  }
  return config
}
