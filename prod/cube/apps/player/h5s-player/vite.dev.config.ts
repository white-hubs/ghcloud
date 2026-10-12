import { defineConfig } from 'vite'
import { getBaseConfig } from './vite.config'

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
  // const proxyTarget = 'https://safe.higreen-gm.com:30000'
  const proxyTarget = 'https://cap2.cdhjx.cn/'

  return {
    ...baseConfig,
    server: {
      host: '0.0.0.0',
      port: 8888,
      proxy: {
        '^/api': {
          target: `${proxyTarget}/api`,
          changeOrigin: true,
          ws: true,
          rewrite: (path: string) => path.replace(/^\/api/, '')
        },
        '/config.js': {
          target: `${proxyTarget}/config.js`,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/config.js/, '')
        },
        '/resource': proxyTarget
      }
    },
  }
})
