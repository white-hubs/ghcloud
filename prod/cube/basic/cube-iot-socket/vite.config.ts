import path from 'path'
import { type UserConfig, defineConfig, type ConfigEnv } from 'vite'

// https://vitejs.dev/config/
const config = await defineConfig(() => {
  return {
    plugins: [
    ],
    resolve: {
      alias: {
        '@ghcloud/cube-message-sdk': path.resolve(__dirname, './src')
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
