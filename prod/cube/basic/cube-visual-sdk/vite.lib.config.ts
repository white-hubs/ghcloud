import { resolve } from 'path'
import { defineConfig } from 'vite'
import { getBaseConfig } from './vite.config'
import dts from 'vite-plugin-dts'
import { deepEntries } from '@ghcloud/vite-utils/lib/module'

// https://vitejs.dev/config/
export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv)
  if (!baseConfig.plugins) {
    baseConfig.plugins = []
  }
  baseConfig.plugins.push(
    dts({
      tsConfigFilePath: './tsconfig.lib.json',
      // TODO(danke): 由于当前插件对硬链接的支持度低会导致部分报错，暂时先忽略错误
      skipDiagnostics: true
    }),
  )
  return {
    ...baseConfig,
    build: {
      cssCodeSplit: true,
      lib: {
        entry: deepEntries(resolve(__dirname, './src'), /\.(tsx?)$/),
        name: 'main',
        formats: ['es'],
      },
      rollupOptions: {
        external: ['vue', /^ant-design-vue\/es\/.*\/style/],
        output: {
          chunkFileNames: 'vendor/vendor.js'
        }
      },
      outDir: resolve(__dirname, './lib')
    },
  }
})
