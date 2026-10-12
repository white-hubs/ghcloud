import path from "path";
import { defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

import { version } from "./package.json";
export default defineConfig((ConfigEnv) => {
  const env = loadEnv(ConfigEnv.mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  const projectName = "todo-center-app";

  return {
    plugins: [
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
    css: {
      preprocessorOptions: {
        less: {
          additionalData: ['@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";'],
          modifyVars: {
            "@ant-prefix": projectName,
            "@root-entry-name": "variable",
            "@cube-theme-antd3-prefix": projectName,
            "@cube-theme-antd3-scope-selector": "#todo-center-app",
          },
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      dedupe: ["dayjs"],
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: publicPath,
    server: {
      host: "0.0.0.0",
      port: 8888,
      origin: "http://localhost:8888",
      proxy: {
        "/api": {
          target: "http://192.168.0.243:40201/api",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
