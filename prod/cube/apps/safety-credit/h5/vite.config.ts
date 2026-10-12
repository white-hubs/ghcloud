import { VantResolver } from "@vant/auto-import-resolver";
import legacy from "@vitejs/plugin-legacy";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import postcsspxtoviewport from "postcss-px-to-viewport";
import Components from "unplugin-vue-components/vite";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";
import { viteVConsole } from "vite-plugin-vconsole";

const config = defineConfig(({ mode }): UserConfig => {
  const env = {
    ...loadEnv(mode, process.cwd(), ""),
    ...loadEnv(mode, __dirname, ""),
  };
  const vConsoleEnable = env.V_CONSOLE === "true";
  const publicPath = env.PUBLIC_PATH ?? "/";
  const applicationCode = "SAFETY_CREDIT";
  return {
    plugins: [
      vueJsx(),
      vue(),
      Components({
        resolvers: [VantResolver({ importStyle: "css" })],
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
          "es.object.keys",
          "es.object.to-string",
          "web.dom-collections.for-each",
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
        applicationCode,
        baseApiUrl: "/api",
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
