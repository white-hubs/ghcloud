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
      headers: {
        'Accsee-Control-Allow-Origin': '*',
      },
      proxy: {
        '^/api': {
          target: 'https://sn-tj.guheyun.cn:40201/api',
          // target: env.VITE_API_URL ?? 'http://192.168.0.243:40201/api',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, '')
        },
        '^/minio': {
          target: 'https://sn-tj.guheyun.cn:40201/api',
          // target: env.VITE_API_URL ?? 'http://192.168.0.243:40201/minio',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/minio/, '')
        }
      },
    },
  }
})
