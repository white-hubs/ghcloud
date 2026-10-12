import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import { type ConfigEnv, type UserConfig, defineConfig } from 'vite'
const config = await defineConfig(() => {
  return {
    plugins: [
      vueJsx(),
    ],
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            '@ant-prefix': 'template'
          },
          javascriptEnabled: true
        }
      },
    },
    resolve: {
      alias: {
        '@ghcloud/cube-qrcode': path.resolve(__dirname, './src'),
      },
    },
  }
})

export async function getBaseConfig (env: ConfigEnv): Promise<UserConfig> {
  if (typeof config === 'function') {
    return config(env)
  }
  return config
}
