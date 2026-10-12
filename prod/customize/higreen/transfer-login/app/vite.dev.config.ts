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
        '^/custom-api': {
          target: 'https://safe.higreen-gm.com:30000/custom-api',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/custom-api/, '')
        },
      }
    },
  }
})
