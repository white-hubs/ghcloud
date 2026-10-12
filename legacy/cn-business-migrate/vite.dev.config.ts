import { getBaseConfig } from './vite.config'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
  const port = 8888
  const env = loadEnv(configEnv.mode, process.cwd(), '')
  const serviceUrl = env.SERVICE_URL ?? '/'
  return {
    ...baseConfig,
    server: {
      host: '0.0.0.0',
      port: port,
      origin: `http://localhost:${port}`,
    },
  }
})
