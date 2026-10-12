import { defineConfig } from 'vite'
import { getBaseConfig } from './vite.config'

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
  // 配置代理目标，可根据实际情况修改
  const proxyTarget = 'http://192.168.0.243:40201/'

  return {
    ...baseConfig,
    server: {
      host: '0.0.0.0',
      port: 8889,
      origin: 'http://localhost:8889',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      proxy: {
        '^/api': {
          target: `${proxyTarget}/api`,
          changeOrigin: true,
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

