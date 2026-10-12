import vue from "@vitejs/plugin-vue";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import qiankun from "vite-plugin-qiankun";
import { createHtmlPlugin } from 'vite-plugin-html'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { version } from './package.json'

const projectName = 'government-management'
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicPath = env.PUBLIC_PATH ?? '/'
  return {
    plugins: [
      vue(),
       vueJsx(),
      createHtmlPlugin({
        inject: {
          data: {
            version
          }
        }
      }),
      qiankun("governmentManagement", {
        useDevMode: true,
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: [
            '@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";',
            // '@import "@ghcloud/cube-ui/lib/style.css";',
          ],
          modifyVars: {
            '@cube-ui-prefix': projectName,
            '@ant-prefix': projectName,
            '@root-entry-name': 'variable',
            '@cube-theme-antd3-prefix': projectName,
            '@cube-theme-antd3-scope-selector': '#governmentManagement'
          },
          // 开启 less js 支持以解决 antdv3 less 样式编译问题
          javascriptEnabled: true
        }
      },
    },
    base: publicPath,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
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
    server: {
      host: "0.0.0.0",
      origin: "//localhost:3200",
      port: 3210,
      headers: {
        "Accsee-Control-Allow-Origin": "*",
      },
      open: true,
      hmr: true,
      proxy: {
        "/newlogin": {
          target: "http://192.168.5.246:8088",
          changeOrigin: true,
          rewrite: path => path.replace(new RegExp(`/newlogin`), ""),
        },
      },
    },
    preview: {
      port: 5050,
    },
  }

});
