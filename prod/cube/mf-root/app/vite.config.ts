import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import type { ConfigEnv, UserConfig, PluginOption } from 'vite'
import tsConfigPathPlugin from 'vite-tsconfig-paths'
import { createHtmlPlugin } from 'vite-plugin-html'
import pkg from './package.json'

const config = defineConfig(async ({ mode }): Promise<UserConfig> => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicPath = env.PUBLIC_PATH ?? './'
  const projectName = pkg.name.replace('@ghcloud/', '')
  return {
    plugins: [
      createHtmlPlugin({
        inject: {
          data: {
            projectName
          }
        }
      }),
      tsConfigPathPlugin(),
    ],
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
      preprocessorOptions: {
        less: {
          additionalData: [
            `
            @import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";
            @import "@ghcloud/cube-mf-root/styles/global-variable.less";
            `
          ],
          modifyVars: {
            '@ant-prefix': projectName,
            '@root-entry-name': 'variable',
            '@cube-theme-antd3-prefix': projectName,
            '@cube-theme-antd3-scope-selector': `#${projectName}`
          },
          javascriptEnabled: true
        }
      },
    },
    resolve: {
      alias: {
        '@ghcloud/cube-mf-root': path.resolve(__dirname, './src'),
      },
    },
    base: publicPath,
    define: {
      /**
       * > String 值会以原始表达式形式使用，所以如果定义了一个字符串常量，它需要被显式地打引号。（例如使用 `JSON.stringify`）
       *
       * [参考](https://cn.vitejs.dev/config/shared-options.html#define)
       */
      __PROJECT_NAME__: JSON.stringify(projectName)
    }
  }
})

export async function getBaseConfig (env: ConfigEnv): Promise<UserConfig> {
  if (typeof config === 'function') {
    return config(env)
  }
  return config
}
