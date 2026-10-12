import { defineConfig, loadEnv } from 'vite'
import { getBaseConfig } from './vite.config'

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
  const env = loadEnv(configEnv.mode, process.cwd(), '')
  return {
    ...baseConfig,
    server: {
      host: '0.0.0.0',
      port: 8888,
      origin: 'http://localhost:8888',
      proxy: {
        '/api': {
          target: env.VUE_APP_SERVICE_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        },
      },
    },
  }
})
