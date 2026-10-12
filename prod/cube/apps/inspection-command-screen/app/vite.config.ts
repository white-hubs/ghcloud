import vueJsx from "@vitejs/plugin-vue-jsx";
import { createRequire } from "node:module";
import path from "path";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

import { version } from "./package.json";

const require = createRequire(import.meta.url);
const mapPluginsRequire = createRequire(require.resolve("@ghcloud/cube-map-plugins/package.json"));
const resolvePackageDir = (packageName: string): string => {
  return path.dirname(mapPluginsRequire.resolve(`${packageName}/package.json`));
};

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  const projectName = "cube-inspection-command-screen-app";
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
            "@cube-theme-antd3-scope-selector": "#InspectionCommandScreenApp",
          },
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        leaflet: resolvePackageDir("leaflet"),
        "leaflet-rotate": resolvePackageDir("leaflet-rotate"),
        "leaflet.chinatmsproviders": resolvePackageDir("leaflet.chinatmsproviders"),
        "leaflet-polylinedecorator": resolvePackageDir("leaflet-polylinedecorator"),
        "leaflet.markercluster": resolvePackageDir("leaflet.markercluster"),
        "leaflet.heat": resolvePackageDir("leaflet.heat"),
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
