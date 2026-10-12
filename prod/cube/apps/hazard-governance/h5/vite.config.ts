import { VantResolver } from "@vant/auto-import-resolver";
import legacy from "@vitejs/plugin-legacy";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import postcsspxtoviewport from "postcss-px-to-viewport";
import Components from "unplugin-vue-components/vite";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import { viteVConsole } from "vite-plugin-vconsole";

import { version } from "./package.json";

const config = await defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const vConsoleEnable = env.V_CONSOLE === "true";
  const publicPath = env.PUBLIC_PATH ?? "/";
  return {
    plugins: [
      vueJsx(),
      Components({
        resolvers: [VantResolver({ importStyle: "css" })],
      }),
      createHtmlPlugin({
        inject: {
          data: {
            version,
          },
        },
      }),
      viteVConsole({
        entry: path.resolve(__dirname, "src/main.ts"),
        localEnabled: vConsoleEnable,
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
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
      postcss: {
        plugins: [
          postcsspxtoviewport({
            unitToConvert: "px",
            viewportWidth: 375,
            unitPrecision: 6,
            propList: ["*"],
            viewportUnit: "vw",
            fontViewportUnit: "vw",
            selectorBlackList: ["ignore-"],
            minPixelValue: 1,
            mediaQuery: false,
            replace: true,
            landscape: false,
          }),
        ],
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: publicPath,
    define: {
      __ENV__: {
        applicationCode: "HAZARD_GOVERNANCE",
        baseApiUrl: "/api",
        authHeaders: env.AUTH_HEADERS !== undefined ? JSON.parse(env.AUTH_HEADERS) : undefined,
        appUser: env.APP_USER !== undefined ? JSON.parse(env.APP_USER) : undefined,
      },
    },
  };
});

export async function getBaseConfig(env: ConfigEnv): Promise<UserConfig> {
  if (typeof config === "function") {
    return config(env);
  }
  return config;
}

export default config;
