import vueJsx from '@vitejs/plugin-vue-jsx'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from 'vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'

const config = await defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicPath = env.PUBLIC_PATH ?? '/'
  return {
    plugins: [
      vueJsx(),
      vue(),
      Components({
        resolvers: [VantResolver({ importStyle: 'css' })]
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        }
      },
      postcss: {
        plugins: [

        ]
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    base: publicPath,
    define: {
      __ENV__: {
        baseApiUrl: '/api',
        authHeaders: env.AUTH_HEADERS !== undefined ? JSON.parse(env.AUTH_HEADERS) : undefined,
        appUser: env.APP_USER !== undefined ? JSON.parse(env.APP_USER) : undefined,
        applicationCode: 'INSPECTION',
      },
    }
  }
})

export async function getBaseConfig (env: ConfigEnv): Promise<UserConfig> {
  if (typeof config === 'function') {
    return config(env)
  }
  return config
}
export default config
