import path from 'path'
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from 'vite'
import { viteVConsole } from 'vite-plugin-vconsole'
import { createHtmlPlugin } from 'vite-plugin-html'
import { version } from './package.json'
import legacy from '@vitejs/plugin-legacy'

const config = await defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicPath = env.PUBLIC_PATH ?? '/'
  const viewVConsole = env.VCONSOLE === 'true'

  return {
    plugins: [
      legacy({
        targets: ['chrome 48'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        renderLegacyChunks: true,
        polyfills: ['es.array.flat', 'es.array.flat-map', 'es.symbol', 'es.array.filter', 'es.promise', 'es.promise.finally', 'es/map', 'es/set', 'es.array.for-each', 'es.object.define-properties', 'es.object.define-property', 'es.object.get-own-property-descriptor', 'es.object.get-own-property-descriptors', 'es.object.keys', 'es.object.to-string', 'web.dom-collections.for-each', 'esnext.global-this', 'esnext.string.match-all', 'es.object.entries', 'es.object.from-entries', 'esnext.object.iterate-entries']
      }),
      createHtmlPlugin({
        inject: {
          data: {
            version
          }
        }
      }),
      viteVConsole({
        entry: path.resolve(__dirname, 'src/main.ts'),
        localEnabled: viewVConsole,
        enabled: viewVConsole,
        config: {
          theme: 'dark'
        }
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    base: publicPath,
  }
})

export async function getBaseConfig (env: ConfigEnv): Promise<UserConfig> {
  if (typeof config === 'function') {
    return config(env)
  }
  return config
}
