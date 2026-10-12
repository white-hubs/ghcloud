import { defineConfig } from 'vite'
import { getBaseConfig } from './vite.config'

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
  return {
    ...baseConfig,
    server: {
      host: '0.0.0.0',
      port: 8888,
      proxy: {
        '/api': {
          target: 'https://cube-dev.guhecloud.com:30000/api',
          changeOrigin: true,
          secure: true,
          rewrite: (path: string) => path.replace(/^\/api/, '')
        }
      }
    },
  }
})
