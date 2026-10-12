import { defineConfig } from 'vite'
import { getBaseConfig } from './vite.config'

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
  return {
    ...baseConfig,

    server: {
      proxy: {
        '^/api': {
          // target: 'https://cap2.cdhjx.cn/api',
          target:"https://cap2.cdhjx.cn/api",
          // target: 'http://192.168.0.133:40201/api',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, '')
        }
      },
      host: '0.0.0.0',
      port: 8888,
      origin: 'http://localhost:8888',
    },
  }
})
