import { defineConfig } from 'vite'
import { getBaseConfig } from './vite.config'

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
  return {
    ...baseConfig,
    server: {
      host: '0.0.0.0',
      port: 8888,
      origin: 'http://localhost:8889',
      proxy: {
        '/api': {
          target: 'https://bimops-test-manage.guhecloud.com:30000/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
      }
    },

  }
})
