import vuePlugin from '@vitejs/plugin-vue'
import vueJsxPlugin from '@vitejs/plugin-vue-jsx'
import path from 'path'
import vueMacros from 'unplugin-vue-macros/dist/vite'
import { type UserConfig, defineConfig, type ConfigEnv } from 'vite'

// https://vitejs.dev/config/
const config = defineConfig(() => {
  const projectName = 'client-ui'
  return {
    plugins: [
      vueMacros({
        plugins: {
          vue: vuePlugin(),
          vueJsx: vueJsxPlugin(),
        }
      }),
    ],
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
            '@cube-theme-antd3-scope-selector': '#todo-center-app'
          },
          javascriptEnabled: true
        }
      }
    },
    resolve: {
      alias: {
        '@ghcloud/cube-ui': path.resolve(__dirname, './src')
      }
    }
  }
})

export async function getBaseConfig (env: ConfigEnv): Promise<UserConfig> {
  if (typeof config === 'function') {
    return config(env)
  }
  return config
}
