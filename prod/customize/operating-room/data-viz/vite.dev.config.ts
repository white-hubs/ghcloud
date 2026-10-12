import { defineConfig } from 'vite'
import { getBaseConfig } from './vite.config'

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
  return {
    ...baseConfig,
    server: {
      https: false,
      host: '0.0.0.0',
      port: 8890,
      origin: 'http://localhost:8890',
      proxy: {
        '/api': {
          // target: 'http://125.71.239.150:40201/',
          // target: 'https://cube-test.guhecloud.com:3000/',
          target: 'http://192.168.0.244:40201/',
          changeOrigin: true,
          ws: true,
        },
      }
    },
  }
})
