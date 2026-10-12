import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from 'vite'
import qiankun from 'vite-plugin-qiankun'

const config = await defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicPath = env.PUBLIC_PATH ?? '/'

  return {
    plugins: [
      vueJsx(),
      vue(),
      qiankun('template', {
        useDevMode: true,
      }),
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
        '@ghcloud/cube-player': path.resolve(__dirname, './src'),
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
