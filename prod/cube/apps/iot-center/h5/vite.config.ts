import { VantResolver } from "@vant/auto-import-resolver";
import legacy from "@vitejs/plugin-legacy";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import postcsspxtoviewport from "postcss-px-to-viewport";
import Components from "unplugin-vue-components/vite";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import { viteVConsole } from "vite-plugin-vconsole";

import { version } from "./package.json";
const cubeScadaRoot = path.resolve(__dirname, "../../../scada/basic");
const config = await defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const vConsoleEnable = env.V_CONSOLE === "true";
  const publicPath = env.PUBLIC_PATH ?? "/";
  return {
    plugins: [
      vueJsx(),
      vue(),
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
            unitToConvert: "px", // 要转化的单位
            viewportWidth: 375, // UI设计稿的宽度
            unitPrecision: 6, // 转换后的精度，即小数点位数
            propList: ["*"], // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换
            viewportUnit: "vw", // 指定需要转换成的视窗单位，默认vw
            fontViewportUnit: "vw", // 指定字体需要转换成的视窗单位，默认vw
            selectorBlackList: ["ignore-"], // 指定不转换为视窗单位的类名，
            minPixelValue: 1, // 默认值1，小于或等于1px则不进行转换
            mediaQuery: false, // 是否在媒体查询的css代码中也进行转换，默认false
            replace: true, // 是否转换后直接更换属性值
            landscape: false, // 是否处理横屏情况
          }),
        ],
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@cube-scada/core": path.resolve(cubeScadaRoot, "core/src/index.ts"),
        "@cube-scada/elements": path.resolve(cubeScadaRoot, "elements/src/index.ts"),
        "@cube-scada/engine": path.resolve(cubeScadaRoot, "engine/src/index.ts"),
        "@cube-scada/renderer": path.resolve(cubeScadaRoot, "renderer/src/index.ts"),
        "@cube-scada/runtime": path.resolve(cubeScadaRoot, "runtime/src/index.ts"),
        "@cube-scada/studio-sdk": path.resolve(cubeScadaRoot, "studio-sdk/src/index.ts"),
      },
    },
    base: publicPath,
    define: {
      __ENV__: {
        applicationCode: "",
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
