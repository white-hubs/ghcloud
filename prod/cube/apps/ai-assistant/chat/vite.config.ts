import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";

import { version } from "./package.json";

//@ts-ignore
export default defineConfig((ConfigEnv) => {
  const env = loadEnv(ConfigEnv.mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  const projectName = "cube-ai-assistant";

  return {
    plugins: [
      basicSsl(),
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
          additionalData: ['@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";'],
          modifyVars: {
            "@ant-prefix": projectName,
            "@root-entry-name": "variable",
            "@cube-theme-antd3-prefix": projectName,
            "@cube-theme-antd3-scope-selector": "#cube-ai-assistant",
          },
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: publicPath,
    server: {
      host: "0.0.0.0",
      port: 1234,
      origin: "http://localhost:1234",
      https: false,
      proxy: {
        "/api-rag": {
          target: "http://192.168.0.222",
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^/api-rag`), "/api"),
        },
        "/api": {
          // target:'https://cube.guhecloud.com:30000',
          target: "http://192.168.0.133:40201",
          changeOrigin: true,
        },
        // '/minio':'https://cube.guhecloud.com:30000'
        "/minio": "http://192.168.0.133:40201",
      },
    },
  };
});
