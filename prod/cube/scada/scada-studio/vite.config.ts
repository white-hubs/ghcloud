import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

import { version } from "./package.json";

const packageRoot = path.resolve(__dirname, "../basic");
const appNodeModules = path.resolve(__dirname, "node_modules");
const cubeScadaAlias = {
  "@cube-scada/core": path.resolve(packageRoot, "core/src/index.ts"),
  "@cube-scada/engine": path.resolve(packageRoot, "engine/src/index.ts"),
  "@cube-scada/renderer": path.resolve(packageRoot, "renderer/src/index.ts"),
  "@cube-scada/editor": path.resolve(packageRoot, "editor/src/index.ts"),
  "@cube-scada/elements": path.resolve(packageRoot, "elements/src/index.ts"),
  "@cube-scada/runtime": path.resolve(packageRoot, "runtime/src/index.ts"),
  "@cube-scada/studio-sdk": path.resolve(packageRoot, "studio-sdk/src/index.ts"),
};
const dependencyAlias = {
  "@ant-design/icons-vue": path.resolve(appNodeModules, "@ant-design/icons-vue"),
  "@antv/x6": path.resolve(appNodeModules, "@antv/x6"),
  "@antv/x6-vue-shape": path.resolve(appNodeModules, "@antv/x6-vue-shape"),
  "ant-design-vue": path.resolve(appNodeModules, "ant-design-vue"),
  pinia: path.resolve(appNodeModules, "pinia"),
  tslib: path.resolve(__dirname, "../../../..", "node_modules/tslib/tslib.es6.mjs"),
  vue: path.resolve(appNodeModules, "vue"),
  "vue-router": path.resolve(appNodeModules, "vue-router"),
};

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  const projectName = "scada-studio";
  return {
    plugins: [
      vue(),
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
        ...dependencyAlias,
        ...cubeScadaAlias,
      },
      dedupe: ["vue"],
    },
    base: publicPath,
    define: {
      __ENV__: {
        applicationCode: "SCADA_STUDIO",
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
