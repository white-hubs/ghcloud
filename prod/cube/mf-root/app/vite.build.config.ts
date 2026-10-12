import { defineConfig } from 'vite'
import { getBaseConfig } from './vite.config'

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
  return {
    ...baseConfig,
    build: {
      lib:{
        entry: 'src/public.ts',
        name: 'cube-mf-root',
        fileName: (format:string) => `cube-mf-root.${format}.js`
      },
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[hash].js',
          assetFileNames: 'assets/[hash].[ext]',
          entryFileNames: '[hash].js',
        }
      }
    },
  }
})
