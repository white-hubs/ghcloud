import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import path from "path"
import { defineConfig, loadEnv } from "vite"
import vitePluginCommonJS from 'vite-plugin-commonjs'
import vitePluginResolveExternals from 'vite-plugin-resolve-externals'
import vitePluginLessImport from './vite-plugin/cube-legacy/less-import'
import requirePlugin from './vite-plugin/require-to-url-plugin/index.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicPath = env.PUBLIC_PATH ?? '/'
  
  return {
    plugins: [
      vitePluginLessImport(),
      vue({
        template: {
          transformAssetUrls: {
            includeAbsolute: false,
          },
        },
      }),
      vueJsx(),
      vitePluginCommonJS(),
      requirePlugin(),
      vitePluginResolveExternals({
        AMap: "AMap",
      }),
    ],

    build: {
      rollupOptions: {
        input: "./index.html",
        output: {
          chunkFileNames: 'assets/[hash].js',
          assetFileNames: 'assets/[hash].[ext]',
          entryFileNames: 'assets/[hash].js',
        }
      },
      commonjsOptions: {
        transformMixedEsModules: true
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          additionalData: [
            `@import "${path.resolve(__dirname, 'src/styles/index.less')}";`,
          ],
          modifyVars: {
            // '@ant-prefix': 'root'
          },
          // 开启 less js 支持以解决 antdv3 less 样式编译问题
          javascriptEnabled: true
        }
      }
    },
    base: publicPath,
    resolve: {
      extensions: ['.vue', '.js', '.jsx', '.json'],
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "~@": path.resolve(__dirname, "./src"),
        "~basscss": path.resolve(__dirname, "./node_modules/basscss"),
        "swiper/vue/swiper-vue.js": path.resolve(__dirname, "./node_modules/swiper/vue/swiper-vue.js"),
        "swiper/modules/navigation/navigation.min.css": path.resolve(__dirname, "./node_modules/swiper/modules/navigation/navigation.min.css"),
        "swiper/modules/pagination/pagination.min.css": path.resolve(__dirname, "./node_modules/swiper/modules/pagination/pagination.min.css"),
        "swiper/modules/scrollbar/scrollbar.min.css": path.resolve(__dirname, "./node_modules/swiper/modules/scrollbar/scrollbar.min.css"),
        "swiper/swiper.min.css": path.resolve(__dirname, "./node_modules/swiper/swiper.min.css"),
      },
    },
    preview: {
      port: 5050,
    },
    optimizeDeps: {
      include: ['dayjs/locale/zh-cn']
    },
    server: {
      https: false,
      proxy: {
        "/api": {
          target: env.VUE_APP_SERVICE_URL,
          changeOrigin: true,
          ws: true,
          rewrite: path => path.replace(/^\/api/, '')
        },
        "/gw-bff": {
          target: env.VUE_APP_SERVICE_URL.replace(/\/api\/?$/, ''),
          changeOrigin: true,
          ws: true
        }
      },

    }
  }
})
