import vue from "@vitejs/plugin-vue"
import path from "path"
import { defineConfig, loadEnv } from "vite"
import qiankun from "vite-plugin-qiankun"
import { createHtmlPlugin } from 'vite-plugin-html'
import { version } from './package.json'
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicPath = env.PUBLIC_PATH ?? '/'
  const baseURL:string = env.VITE_BASE_API
  const projectName = 'legacy-consumption-management'
  return {
    plugins: [
      vue(),
      createHtmlPlugin({
        inject: {
          data: {
            version
          }
        }
      }),
      qiankun(publicPath, {
        useDevMode: true,
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          additionalData: [
            '@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";',
          ],
          modifyVars: {
            '@ant-prefix': projectName,
            '@root-entry-name': 'variable',
            '@cube-theme-antd3-prefix': projectName,
            '@cube-theme-antd3-scope-selector': '#ConsumptionManagementApp'
          },
          javascriptEnabled: true
        }
      },
    },
    base: publicPath,
    server: {
      host: "0.0.0.0",
      origin: "//localhost:3210",
      port: 3210,
      headers: {
        "Accsee-Control-Allow-Origin": "*",
      },
      open: false,
      hmr: true,
      proxy:{
        '^/api':{
          target:baseURL,
          changeOrigin:true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[hash].js',
          assetFileNames: 'assets/[hash].[ext]',
          entryFileNames: 'assets/[hash].js',
        }
      }
    },
    preview: {
      port: 5050,
    },
  }
})
