import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import { type ConfigEnv, type UserConfig, defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

import { version } from "./package.json";
const envs = {
  dev: {
    publicPath: "/apps/@ghcloud/cube-alarm-center-app",
  },
  development: {
    publicPath: "/apps/@ghcloud/cube-alarm-center-app",
  },
  test: {
    publicPath: "/apps/@ghcloud/cube-alarm-center-app",
  },
  prod: {
    publicPath: "/apps/@ghcloud/cube-alarm-center-app",
  },
};
const config = defineConfig(({ mode }) => {
  const publicPath = envs[mode]?.publicPath ?? "/";
  const projectName = "alarm-center";
  return {
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
    css: {
      preprocessorOptions: {
        less: {
          additionalData: ['@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";'],
          modifyVars: {
            "@cube-ui-prefix": projectName,
            "@ant-prefix": projectName,
            "@root-entry-name": "variable",
            "@cube-theme-antd3-prefix": projectName,
            "@cube-theme-antd3-scope-selector": "#AlarmCenterApp",
          },
          javascriptEnabled: true,
        },
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
        applicationCode: "ALARM_CENTER",
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
