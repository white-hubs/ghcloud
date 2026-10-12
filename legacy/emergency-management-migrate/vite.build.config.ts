import { defineConfig } from 'vite'
import { getBaseConfig } from './vite.config'
import pkg from './package.json'



export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
  return {
    ...baseConfig,
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[hash].js',
          assetFileNames: 'assets/[hash].[ext]',
          entryFileNames: 'assets/[hash].js',
        }
      }
    },
  }
})
