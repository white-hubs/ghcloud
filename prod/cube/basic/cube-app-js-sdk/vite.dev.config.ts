import { defineConfig } from 'vite'
import { getBaseConfig } from './vite.config'

// https://vitejs.dev/config/
export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
  return {
    ...baseConfig,
    server: {
      host: '0.0.0.0',
    },
  }
})
