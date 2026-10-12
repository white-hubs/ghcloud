import { defineConfig } from 'vite'
import { getBaseConfig } from './vite.config'

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
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
          target: 'http://192.168.0.243:40201/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        '/resource': 'http://192.168.0.243:40201'
      }
    },
  }
})
