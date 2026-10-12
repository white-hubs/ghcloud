
import vue from "@vitejs/plugin-vue"
import postCssPxToRem from "postcss-pxtorem"
import path from "path"
import { defineConfig, loadEnv } from "vite"
import { viteMockServe } from 'vite-plugin-mock'
import {createHtmlPlugin} from 'vite-plugin-html'
//@ts-ignore
import { version } from './package.json'

import vueJsx from "@vitejs/plugin-vue-jsx";

const ignoreResourcePaths = () => ({
  name: 'ignore-resource-paths',
  resolveId(id: string) {
    if (id.startsWith('/resource/v1/')) return { id, external: true }
    return null
  },
})

//@ts-ignore
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicPath = env.PUBLIC_PATH ?? '/'
  const baseURL:string = env.VITE_BASE_API
  const projectName = 'ue5-sn-migrate'
  
  return {
    plugins: [
      vue(),
      vueJsx(),
      ignoreResourcePaths(),
      createHtmlPlugin({
        inject:{
          data:{
            ...env,
            publicPath:publicPath,
            version
          }
        }
      }),
      viteMockServe({
        mockPath:"./src/mock/",
        localEnabled: false,   // 是否开启开发环境
        prodEnabled:false,  //是否开启生产环境
        watchFiles:true,
        injectCode:`import { setupProdMockServer } from './mockProdServer';
        setupProdMockServer();`,
        logger:true,    //是否在控制台显示日志
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "~@":path.resolve(__dirname,"./src")
      },
    },
  
    assetsInclude: ['**/*.HDR', '**/*.hdr'],
    base: publicPath,
    server: {
      host: "0.0.0.0",
      origin:'http://localhost:8098',
      port: 8098,
      headers: {
        "Accsee-Control-Allow-Origin": "*",
      },
      open: false,
      hmr: true,
      proxy:{
        '^/minio':{
          target:'https://cube.guhecloud.com:3000/minio',
          changeOrigin:true,
          rewrite: (path) => path.replace(/^\/minio/, '')
        },
        '^/resource':{
          target:'http://192.168.0.243:40201/resource',
          changeOrigin:true,
          rewrite: (path) => path.replace(/^\/resource/, '')
        },
        '/apps/@ghcloud/cube-ai-assistant-chat': {
          target: baseURL.replace('/api',''),
          changeOrigin: true,
          secure: false
        },
        '^/gw-bff':{
          target:baseURL.replace(/\/api\/?$/, ''),
          changeOrigin:true,
          ws:true
        },
        '^/api':{
          target:baseURL,
          changeOrigin:true,
          ws:true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
      }
    },
    preview: {
      port: 5050,
    },
 
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        external: (id: string) => id.startsWith('/resource/v1/'),
        output: {
          chunkFileNames: 'assets/[hash].js',
          assetFileNames: 'assets/[hash].[ext]',
          entryFileNames: 'assets/[hash].js',
        }
      }
    },
    css:{
      preprocessorOptions:{
        less:{
          /**修改ant-design-vue主题色 */
          modifyVars:{
            '@ant-prefix': projectName,
            '@cube-theme-antd3-prefix': projectName,
            'primary-color':'#2989FF',
            'link-color': '#2989FF',
            'border-radius-base': '2px',
            "root-entry-name":"default",
            'border-color-base':'#2989FF'
          },
          javascriptEnabled: true,
        }
      },
      postcss:{
        plugins:[
          postCssPxToRem({
            rootValue:192,
            propList:["*"] //需要转化的属性
          })
        ]
      }
    },
  }
})


