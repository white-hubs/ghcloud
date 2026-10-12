import vueJsx from "@vitejs/plugin-vue-jsx";
import { createRequire } from "node:module";
import path from "node:path";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

import { version } from "./package.json";

const require = createRequire(import.meta.url);
const requireFromAntDesignVue = createRequire(require.resolve("ant-design-vue/package.json"));
const tinycolorDir = path.dirname(requireFromAntDesignVue.resolve("@ctrl/tinycolor/package.json"));

const projectName = "cube-video-monitor-app";

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/apps/cube-video-monitor-app/";

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
            "@cube-theme-antd3-scope-selector": "#cube-video-monitor-app",
          },
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        "@ctrl/tinycolor": tinycolorDir,
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: publicPath,
  };
});

export async function getBaseConfig(env: ConfigEnv): Promise<UserConfig> {
  if (typeof config === "function") {
    return config(env);
  }
  return config;
}
