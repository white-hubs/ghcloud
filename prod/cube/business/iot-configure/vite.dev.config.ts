import { defineConfig } from 'vite'
import { getBaseConfig } from './vite.config'

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
  return {
    ...baseConfig,
    server: {
      host: '0.0.0.0',
      port: 5555,
      proxy: {
        '/api': {
          // target: env.VUE_APP_SERVICE_URL,
          // target: 'http://192.168.0.243:9898/api',
          target: 'http://127.0.0.1:9999/api',
          // target: 'http://192.168.4.173:9999/api',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        },
      },
    },
  }
})
