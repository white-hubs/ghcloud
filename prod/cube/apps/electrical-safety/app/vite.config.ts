import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "node:path";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

import { version } from "./package.json";

const cubeScadaRoot = path.resolve(__dirname, "../../../scada/basic");

/**
 * Qiankun 项目名与主应用 `/portal/<slug>` 路径段必须一致。
 * 替换此处值 = 替换 `src/main.ts#mount` 的 `base` = 替换主应用菜单的 `path` 前缀。
 */
const projectName = "electrical-safety";

const config = defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  // 构建侧变量（非 VITE_ 前缀），所以 loadEnv 用空前缀
  // - PUBLIC_PATH 由 CI / nginx / 主应用部署配置按需覆盖
  // - 本地启动默认 `/`，构建默认使用主应用的部署路径
  const env = loadEnv(mode, process.cwd(), "");
  const defaultPublicPath = command === "serve" ? "/" : "/apps/@ghcloud/cube-electrical-safety-app";
  const publicPath = env.PUBLIC_PATH ?? defaultPublicPath;

  return {
    plugins: [
      vueJsx(),
      createHtmlPlugin({
        inject: {
          data: { version },
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
            "@cube-ui-prefix": projectName,
            "@ant-prefix": projectName,
            "@root-entry-name": "variable",
            "@cube-theme-antd3-prefix": projectName,
            "@cube-theme-antd3-scope-selector": "#ElectricalSafety",
          },
          javascriptEnabled: true,
        },
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
      dedupe: ["vue"],
    },
    base: publicPath,
    define: {
      __ENV__: {
        applicationCode: "ELECTRICAL_SAFETY",
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
