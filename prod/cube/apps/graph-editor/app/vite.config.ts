import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from 'vite'
import qiankun from 'vite-plugin-qiankun'
import { createHtmlPlugin } from 'vite-plugin-html'
import { version } from './package.json'

const config = defineConfig(({ mode, command }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicPath = env.PUBLIC_PATH ?? '/'
  const projectName = 'graph-editor'
  // build 时 useDevMode 须为 false，否则输出的 ESM 在 qiankun eval 执行时会报 SyntaxError
  const useDevMode = command !== 'build'

  return {
    plugins: [
      vue(),
      vueJsx(),
      qiankun(projectName, {
        useDevMode,
      }),
      createHtmlPlugin({
        inject: {
          data: {
            version,
          },
        },
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: [
            '@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";',
          ],
          modifyVars: {
            '@cube-ui-prefix': projectName,
            '@ant-prefix': projectName,
            '@root-entry-name': 'variable',
            '@cube-theme-antd3-prefix': projectName,
            '@cube-theme-antd3-scope-selector': '#GraphEditorApp',
          },
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@ghcloud/cube-graph-editor-core': path.resolve(__dirname, '../../../basic/cube-graph-editor-basic/cube-graph-editor-core/src'),
        '@ghcloud/cube-graph-editor-electrical': path.resolve(
          __dirname,
          '../../../basic/cube-graph-editor-basic/cube-graph-editor-electrical/src',
        ),
      },
    },
    base: publicPath,
    define: {
      __ENV__: {
        applicationCode: 'GRAPH_EDITOR',
      },
    },
  }
})

export default config

export async function getBaseConfig(env: ConfigEnv): Promise<UserConfig> {
  if (typeof config === 'function') {
    return config(env)
  }

  return config
}
