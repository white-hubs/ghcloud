import { version } from "./package.json";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

const config = defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  const projectName = "cloud-qr-code";
  return {
    plugins: [
      vueJsx(),
      qiankun(projectName, {
        useDevMode: true,
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
          additionalData: ['@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";'],
          modifyVars: {
            "@cube-ui-prefix": projectName,
            "@ant-prefix": projectName,
            "@root-entry-name": "variable",
            "@cube-theme-antd3-prefix": projectName,
            "@cube-theme-antd3-scope-selector": "#CloudQrCodeApp",
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
        applicationCode: "CLOUD-QR-CODE",
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
