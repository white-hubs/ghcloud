import { defineConfig, loadEnv } from 'vite'
import { getBaseConfig } from './vite.config'

export default defineConfig(async (configEnv) => {
  const env = loadEnv(configEnv.mode, process.cwd(), '')
  const baseConfig = await getBaseConfig(configEnv)
  return {
    ...baseConfig,
    server: {
      host: '0.0.0.0',
      port: 8888,
      proxy: {
        '^/api': {
          target: env.VITE_API_URL ?? 'https://cap2.cdhjx.cn/api',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, '')
        },
        '^/minio': {
          target: env.VITE_API_URL ?? 'http://192.168.0.244:40201/minio',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/minio/, '')
        }
      },
    },
  }
})
