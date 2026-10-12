import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";

import packageJson from "./package.json";

//@ts-ignore
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  const serviceUrl = env.VUE_APP_SERVICE_URL || "http://192.168.0.243:40201/api";
  const domainUrl = env.VUE_APP_DOMAIN_URL || serviceUrl.replace(/\/api\/?$/, "");
  const serviceOrigin = serviceUrl.replace(/\/api\/?$/, "");
  return {
    plugins: [
      vue({
        template: {
          transformAssetUrls: {
            includeAbsolute: false,
          },
        },
      }),
      vueJsx(),
      // HTML模板处理
      createHtmlPlugin({
        inject: {
          data: {
            version: packageJson.version,
            publicPath,
          },
        },
      }),
    ],

    // 基础配置
    base: publicPath,
    // 构建配置
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          chunkFileNames: "assets/[hash].js",
          assetFileNames: "assets/[hash].[ext]",
          entryFileNames: "assets/[hash].js",
          // 外部依赖配置
          globals: {
            AMap: "AMap",
          },
        },
        external: (id: string) => id === "AMap",
      },
    },

    // 开发服务器配置
    server: {
      port: 8082,
      proxy: {
        "/api": {
          target: serviceUrl,
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/gw-bff": {
          target: serviceOrigin,
          changeOrigin: true,
          ws: true,
        },
        "/resource": domainUrl,
        "/minio": domainUrl,
        "/apps/@ghcloud/cube-ai-assistant-chat": {
          target: serviceOrigin,
          changeOrigin: true,
          secure: false,
        },
        "/apps/todo-center/app": {
          target: serviceOrigin,
          changeOrigin: true,
          secure: false,
        },
        "/apps/@ghcloud/cube-alarm-modal": {
          target: serviceOrigin,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // CSS预处理配置
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `@import "${path.resolve(__dirname, "src/styles/index.less")}";`,
        },
      },
    },

    // 资源处理
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      extensions: [".js", ".ts", ".jsx", ".tsx", ".vue"], // 关键配置
    },
  };
});
