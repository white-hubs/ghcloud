import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

import { version } from "./package.json";

const config = defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  const projectName = "drone";

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
            "@cube-theme-antd3-scope-selector": "#DroneApp",
          },
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@ghcloud/cube-map-plugins": path.resolve(__dirname, "../../../basic/cube-map-plugins/src/main.ts"),
        leaflet: path.resolve(__dirname, "../../../../../node_modules/.bun/node_modules/leaflet"),
        "leaflet-rotate": path.resolve(__dirname, "../../../../../node_modules/.bun/node_modules/leaflet-rotate"),
        "leaflet.chinatmsproviders": path.resolve(__dirname, "../../../../../node_modules/.bun/node_modules/leaflet.chinatmsproviders"),
        "leaflet-polylinedecorator": path.resolve(__dirname, "../../../../../node_modules/.bun/node_modules/leaflet-polylinedecorator"),
        "leaflet.markercluster": path.resolve(__dirname, "../../../../../node_modules/.bun/node_modules/leaflet.markercluster"),
        "leaflet.heat": path.resolve(__dirname, "../../../../../node_modules/.bun/node_modules/leaflet.heat"),
      },
    },
    base: publicPath,
    define: {
      __ENV__: {
        applicationCode: "DRONE",
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
