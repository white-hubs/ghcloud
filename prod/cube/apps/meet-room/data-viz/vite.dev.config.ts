import { defineConfig } from 'vite'
import { getBaseConfig } from './vite.config'

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
  return {
    ...baseConfig,
    server: {
      https: false,
      host: '0.0.0.0',
      port: 8888,
      origin: 'http://localhost:8888',
      proxy: {
        '/api': {
          // target: 'https://cube-test.guhecloud.com:3000/',
          target: 'http://192.168.0.243:40201/',
          changeOrigin: true,
          ws: true,
        },
      }
    },
  }
})
