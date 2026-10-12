import { defineConfig, ENV_DEVELOPMENT, UserConfig } from "@farmfe/core";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "node:path";

import { qiankunFarmPlugin } from "@ghcloud/farm-plugin-qiankun";

import pkg from "./package.json";

const isDev = process.env.NODE_ENV === ENV_DEVELOPMENT;

export default defineConfig({
  vitePlugins: [vueJsx(), vue()],
  plugins: [qiankunFarmPlugin({ appName: pkg.name, devMode: true })],
  compilation: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    output: {
      path: path.resolve(__dirname, "./dist"),
      publicPath: isDev ? "http://localhost:9000/" : "/apps/cube-video-monitor-app/",
      filename: "[resourceName]-[contentHash].[ext]",
      assetsFilename: "[resourceName]-[contentHash].[ext]",
    },
    // treeShaking: false,
    // minify: false,
    sourcemap: isDev,
  },
  server: {
    cors: true,
    port: 9000,
    proxy: {
      "/api": {
        target: "http://192.168.0.243:30101/api",
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ""),
      },
      "/gw-bff": {
        target: "http://192.168.4.119:3000",
        changeOrigin: true,
        // rewrite: (path: string) => path.replace(/^\/api/, ""),
      },
    },
    preview: {
      cors: true,
      port: 9000,
    },
    hmr: {
      host: "localhost",
      port: 9001,
      protocol: "ws",
    },
  },
});
