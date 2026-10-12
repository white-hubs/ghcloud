import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "node:path";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

import { version } from "./package.json";

/**
 * Qiankun 项目名与主应用 `/portal/<slug>` 路径段必须一致。
 * 替换此处值 = 替换 `src/main.ts#mount` 的 `base` = 替换主应用菜单的 `path` 前缀。
 */
const projectName = "personnel-positioning";

const config = defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // 构建侧变量（非 VITE_ 前缀），所以 loadEnv 用空前缀
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";

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
            "@cube-theme-antd3-scope-selector": "#PersonnelPositioning",
          },
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["vue", "pinia"],
    },
    base: publicPath,
    define: {
      __ENV__: {
        applicationCode: env.VITE_APPLICATION_CODE || "PERSONNEL_POSITIONING",
        mock: env.VITE_USE_MOCK === "true" && mode !== "prod",
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
