import { defineConfig } from 'vite'
import { getBaseConfig } from './vite.config'
import pkg from './package.json'
const invalidChunkNameRe = /[\s-_]/g

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
  return {
    ...baseConfig,
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: (chunk) => {
            const chunkName = chunk.name.replace(invalidChunkNameRe, '')
            const projectName = pkg.name.replace(invalidChunkNameRe, '')
            return `assets/${projectName}-${chunkName}.js`
          },
          assetFileNames: (chunk) => {
            const chunkName = chunk.name.replace(invalidChunkNameRe, '').replace(/^index\.(\w+)/, 'entry.$1')
            const projectName = pkg.name.replace(invalidChunkNameRe, '')
            return `assets/${projectName}-${chunkName}`
          },
          entryFileNames: () => {
            const projectName = pkg.name.replace(invalidChunkNameRe, '')
            return `assets/${projectName}-entry.js`
          },
        },
      }
    },
  }
})
