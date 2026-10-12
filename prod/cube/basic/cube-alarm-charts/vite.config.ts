import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from 'vite'
const config = await defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicPath = env.PUBLIC_PATH ?? '/'

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
        '@ghcloud/cube-alarm-charts': path.resolve(__dirname, './src'),
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
