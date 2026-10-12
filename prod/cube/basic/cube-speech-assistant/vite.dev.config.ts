import { defineConfig } from 'vite'
import { getBaseConfig } from './vite.config'

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)

  return {
    ...baseConfig,
    server: {
      host: '0.0.0.0',
      port: 1234,
      origin: 'http://localhost:1234',
      headers: {
        'Accsee-Control-Allow-Origin': '*',
      },
      proxy: {
      }
    },
  }
})
