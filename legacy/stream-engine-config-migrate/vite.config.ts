import vue from "@vitejs/plugin-vue2";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

import { version } from "./package.json";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = "/apps-legacy/stream-engine-config";
  const projectName = "flow-engine";

  return {
    plugins: [
      vue(),
      createHtmlPlugin({
        inject: {
          data: {
            version,
          },
        },
      }),
      qiankun(projectName, {
        useDevMode: true,
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: "assets/[hash].js",
          assetFileNames: "assets/[hash].[ext]",
          entryFileNames: "assets/[hash].js",
        },
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          additionalData: ['@import "./src/assets/theme.less";'],
          modifyVars: {},
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        leaflet: path.resolve(__dirname, "../../node_modules/.bun/node_modules/leaflet"),
        vue: "vue/dist/vue.runtime.esm.js",
      },
      extensions: [".vue", ".js", ".css", ".less"],
    },
    optimizeDeps: {
      esbuildOptions: {
        external: ["leaflet"],
      },
    },
    base: publicPath,
    server: {
      host: "0.0.0.0",
      origin: "http://localhost:1024",
      port: 1024,
      headers: {
        "Accsee-Control-Allow-Origin": "*",
      },
      open: false,
      hmr: true,
      proxy: {
        "/api": {
          // 要代理的地址
          target: env.VUE_APP_SERVICE_URL,
          //允许跨域
          changeOrigin: true,
          // 如果是https接口的话，需要配置这个参数
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/gw-bff": {
          target: env.VUE_APP_SERVICE_URL?.replace(/\/api\/?$/, ""),
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
