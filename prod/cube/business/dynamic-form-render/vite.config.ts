import vuePlugin from '@vitejs/plugin-vue'
import vueJsxPlugin from '@vitejs/plugin-vue-jsx'
import path from 'path'
import vueMacros from 'unplugin-vue-macros/dist/vite'
import { type UserConfig, defineConfig, type ConfigEnv } from 'vite'

// https://vitejs.dev/config/
const config = await defineConfig(() => {
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
          // 开启 less js 支持以解决 antdv3 less 样式编译问题
          javascriptEnabled: true
        }
      },
      requireModuleExtension: true
    },
    resolve: {
      alias: {
        '@ghcloud/dynamic-form-render': path.resolve(__dirname, './src')
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
