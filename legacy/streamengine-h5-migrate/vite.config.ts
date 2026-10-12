import legacy from "@vitejs/plugin-legacy";
import vuePlugin from "@vitejs/plugin-vue";
import vueJsxPlugin from "@vitejs/plugin-vue-jsx";
import path from "path";
import { VantResolver } from "unplugin-vue-components/resolvers";
import unpluginVueComponent from "unplugin-vue-components/vite";
import vueMacros from "unplugin-vue-macros/dist/vite";
import { defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import { viteVConsole } from "vite-plugin-vconsole";
// @ts-expect-error
import { version } from "./package.json";
/**
 * 是否在 app 内嵌模式viteVConsole
 */

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isAppEmbedMode = env.APP_EMBED === "true";
  const vConsoleEnable = env.V_CONSOLE === "true";
  return {
    plugins: [
      vueMacros({
        plugins: {
          vue: vuePlugin(),
          vueJsx: vueJsxPlugin(),
        },
      }),
      createHtmlPlugin({
        inject: {
          data: {
            version,
          },
        },
      }),
      // vuePlugin(),
      // vueJsxPlugin(),
      unpluginVueComponent({
        resolvers: [VantResolver({ importStyle: "css" })],
      }),
      viteVConsole({
        entry: path.resolve(__dirname, "src/main.ts"),
        localEnabled: isAppEmbedMode,
        enabled: vConsoleEnable,
        config: {
          theme: "dark",
        },
      }),
      legacy({
        targets: ["chrome 48"],
        additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
        renderLegacyChunks: true,
        polyfills: [
          "es.array.flat",
          "es.array.flat-map",
          "es.symbol",
          "es.array.filter",
          "es.promise",
          "es.promise.finally",
          "es/map",
          "es/set",
          "es.array.for-each",
          "es.object.define-properties",
          "es.object.define-property",
          "es.object.get-own-property-descriptor",
          "es.object.get-own-property-descriptors",
          "es.object.keys",
          "es.object.to-string",
          "web.dom-collections.for-each",
          "esnext.global-this",
          "esnext.string.match-all",
          "es.object.entries",
          "es.object.from-entries",
          "esnext.object.iterate-entries",
        ],
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      origin: "//localhost:8099",
      port: 8098,
      headers: {
        "Accsee-Control-Allow-Origin": "*",
      },
      open: false,
      hmr: true,
      proxy: {
        "^/gw-bff": {
          target: "https://cube.guhecloud.com/",
          changeOrigin: true,
        },
        "^/api": {
          target: "https://cube.guhecloud.com/api",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "^/minio": {
          target: "https://cube.guhecloud.com/minio",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/minio/, ""),
        },
      },
    },
    build: {
      target: ["chrome52", "ios11"],
      rollupOptions: {
        output: {
          // TODO(danke): 临时解决构建目标 [name] 中因 vue script 标签使用泛型导致存在空格的问题
          chunkFileNames: "assets/[hash].js",
          assetFileNames: "assets/[hash].[ext]",
          entryFileNames: "assets/[hash].js",
        },
      },
    },

    base: "/streamengineH5",
    preview: {
      port: 4173,
    },
    define: {
      __ENV__: {
        isAppEmbedMode,
        baseApiUrL: env.BASE_API_URL,
        authHeaders: !isAppEmbedMode && env.AUTH_HEADERS !== undefined ? JSON.parse(env.AUTH_HEADERS) : undefined,
        appUser: !isAppEmbedMode && env.APP_USER !== undefined ? JSON.parse(env.APP_USER) : undefined,
      },
    },
  };
});
