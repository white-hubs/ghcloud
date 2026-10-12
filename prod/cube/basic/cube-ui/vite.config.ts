import vuePlugin from '@vitejs/plugin-vue'
import vueJsxPlugin from '@vitejs/plugin-vue-jsx'
import path from 'path'
import vueMacros from 'unplugin-vue-macros/dist/vite'
import { type UserConfig, defineConfig, type ConfigEnv } from 'vite'

// https://vitejs.dev/config/
const config = await defineConfig(() => {
  const projectName = 'cube-ui'
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
            // '@cube-ui-prefix: ~\'@{cube-ui-prefix}\';',
            // '@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";',
          ],
          modifyVars: {
            '@cube-ui-prefix': 'default;',
            '@ant-prefix': 'default;',
            '@root-entry-name': 'variable',
            '@cube-theme-antd3-prefix': '@cube-ui-prefix',
            // '@cube-theme-antd3-scope-selector': ''
          },
          // 开启 less js 支持以解决 antdv3 less 样式编译问题
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
