import vuePlugin from '@vitejs/plugin-vue'
import vueJsxPlugin from '@vitejs/plugin-vue-jsx'
import path from 'path'
import vueMacros from 'unplugin-vue-macros/dist/vite'
import { type UserConfig, defineConfig, type ConfigEnv } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
const config = await defineConfig(() => {
  const projectName = 'visual-view-ui'
  return {
    plugins: [
      vueMacros({
        plugins: {
          vue: vuePlugin(),
          vueJsx: vueJsxPlugin(),
        }
      }),
      AutoImport({
        imports: [
          'vue',
          {
            'naive-ui': [
              'useDialog',
              'useMessage',
              'useNotification',
              'useLoadingBar'
            ]
          }
        ]
      }),
      Components({
        resolvers: [NaiveUiResolver()]
      })
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: [
            // '@cube-ui-prefix: ~\'@{cube-ui-prefix}\';',
            // '@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";',
          ],
          modifyVars: {
            '@visual-view-ui-prefix': 'default;',
            // '@ant-prefix': 'default;',
            '@root-entry-name': 'variable',
            // '@cube-theme-antd3-prefix': '@cube-ui-prefix',
            // '@cube-theme-antd3-scope-selector': ''
          },
          // 开启 less js 支持以解决 antdv3 less 样式编译问题
          javascriptEnabled: true
        }
      }
    },
    resolve: {
      alias: {
        '@ghcloud/visual-view-ui': path.resolve(__dirname, './src')
      }
    }
  }
})

export async function getBaseConfig(env: ConfigEnv): Promise<UserConfig> {
  if (typeof config === 'function') {
    return config(env)
  }
  return config
}
