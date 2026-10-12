import { defineConfig } from 'vite'
import { getBaseConfig } from './vite.config'
import { resolve } from 'path'

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
  return {
    ...baseConfig,
    build: {
      rollupOptions: {
        external: ['echarts', 'vue'],
      },
      lib: {
        entry: resolve(__dirname, 'src/main.ts'),
        name: 'alarm-chart-components',
        fileName: (format) => `alarm-chart-components.${format}.js`
      }
    },
  }
})
