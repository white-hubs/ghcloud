import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from 'vite'
import qiankun from 'vite-plugin-qiankun'
import pugPlugin from 'vue-pug-plugin'
import vuePlugin from '@vitejs/plugin-vue'
import { createHtmlPlugin } from 'vite-plugin-html'
import { version } from './package.json'
const config = await defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicPath = env.PUBLIC_PATH ?? '/'
  const projectName = 'legacy-meatSlider'
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
      vueJsx(),
      createHtmlPlugin({
        inject: {
          data: {
            version
          }
        }
      }),
      qiankun(projectName, {
        useDevMode: true,
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: [
            '@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";@import "@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/base.less";',
          ],
          modifyVars: {
            '@ant-prefix': projectName,
            '@root-entry-name': 'variable',
            '@cube-theme-antd3-prefix': projectName,
            '@cube-theme-antd3-scope-selector': '#MeatSlidertApp'
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
  }

})

export async function getBaseConfig (env: ConfigEnv): Promise<UserConfig> {
  if (typeof config === 'function') {
    return config(env)
  }
  return config
}
