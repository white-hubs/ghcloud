import { VantResolver } from "@vant/auto-import-resolver";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import postcsspxtoviewport from "postcss-px-to-viewport";
import ComponentsImport from "unplugin-vue-components/vite";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";

import { version } from "./package.json";

const Components = (ComponentsImport as unknown as { default?: typeof ComponentsImport }).default ?? ComponentsImport;

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
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
        baseApiUrl: "/api",
        authHeaders: env.AUTH_HEADERS !== undefined ? JSON.parse(env.AUTH_HEADERS) : undefined,
        appUser: env.APP_USER !== undefined ? JSON.parse(env.APP_USER) : undefined,
        applicationCode: "SAFETY_DUTY",
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
