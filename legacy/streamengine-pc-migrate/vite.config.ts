import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

import { version } from "./package.json";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "";
  const projectName = "template";
  return {
    plugins: [
      vue(),
      qiankun("stream-engine-render", {
        useDevMode: true,
      }),
      createHtmlPlugin({
        inject: {
          data: {
            version,
          },
        },
      }),
      vueJsx(),
    ],
    base: publicPath,
    css: {
      preprocessorOptions: {
        less: {
          additionalData: ['@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";'],
          modifyVars: {
            "@cube-ui-prefix": projectName,
            "@ant-prefix": projectName,
            "@root-entry-name": "variable",
            "@cube-theme-antd3-prefix": projectName,
            "@cube-theme-antd3-scope-selector": "#StreamEngineRenderApp",
          },
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        leaflet: path.resolve(__dirname, "../../node_modules/.bun/node_modules/leaflet"),
        vue: "vue/dist/vue.runtime.esm-browser.js",
      },
    },
    optimizeDeps: {
      include: ["dayjs/locale/zh-cn"],
      esbuildOptions: {
        external: ["leaflet"],
      },
    },
    server: {
      host: "0.0.0.0",
      origin: "//localhost:3200",
      port: 3200,
      headers: {
        "Accsee-Control-Allow-Origin": "*",
      },
      open: false,
      hmr: true,
    },
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: "assets/[hash].js",
          assetFileNames: "assets/[hash].[ext]",
          entryFileNames: "assets/[hash].js",
        },
      },
    },
    preview: {
      port: 5050,
    },
  };
});
