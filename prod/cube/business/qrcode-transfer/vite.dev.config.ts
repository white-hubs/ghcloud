import { defineConfig, loadEnv } from 'vite'
import { getBaseConfig } from './vite.config'

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
  const env = loadEnv(configEnv.mode, process.cwd(), '')
  const baseURL: string = env.VITE_BASE_API
  return {
    ...baseConfig,
    server: {
      host: '0.0.0.0',
      port: 8888,
      origin: 'http://localhost:8888',
      headers: {
        'Accsee-Control-Allow-Origin': '*',
      },
      proxy: {
        '^/api': {
          target: baseURL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
      }
    },
  }
})
