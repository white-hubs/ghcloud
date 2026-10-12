import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

import { version } from "./package.json";

const cubeScadaRoot = path.resolve(__dirname, "../basic");
const appNodeModules = path.resolve(__dirname, "node_modules");

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  const projectName = "scada-demo";
  return {
    publicDir: path.resolve(__dirname, "../scada-studio/public"),
    plugins: [
      vueJsx(),
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
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@cube-scada/core": path.resolve(cubeScadaRoot, "core/src/index.ts"),
        "@cube-scada/elements": path.resolve(cubeScadaRoot, "elements/src/index.ts"),
        "@cube-scada/engine": path.resolve(cubeScadaRoot, "engine/src/index.ts"),
        "@cube-scada/renderer": path.resolve(cubeScadaRoot, "renderer/src/index.ts"),
        "@cube-scada/runtime": path.resolve(cubeScadaRoot, "runtime/src/index.ts"),
        "@cube-scada/studio-sdk": path.resolve(cubeScadaRoot, "studio-sdk/src/index.ts"),
        pinia: path.resolve(appNodeModules, "pinia"),
        vue: path.resolve(appNodeModules, "vue"),
        "vue-router": path.resolve(appNodeModules, "vue-router"),
      },
      dedupe: ["vue"],
    },
    base: publicPath,
    define: {
      __ENV__: {
        applicationCode: "SCADA_DEMO",
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
