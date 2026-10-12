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
const genericComponentEntry = path.resolve(__dirname, "../../../business/generic-component/src/main.ts");

/** 与主应用注册的微应用 name、挂载 id、ConfigProvider prefixCls 保持一致 */
const projectName = "cube-visualization-app";

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/apps/cube-visualization-app/";

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
            "@cube-theme-antd3-scope-selector": `#${projectName}`,
          },
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        "@ctrl/tinycolor": tinycolorDir,
        "@": path.resolve(__dirname, "./src"),
        // 显式指向源码入口，避免 workspace 链接在部分 Vite 场景下解析失败
        "@ghcloud/generic-component": genericComponentEntry,
      },
    },
    server: {
      fs: {
        allow: [path.resolve(__dirname, "../../..")],
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
