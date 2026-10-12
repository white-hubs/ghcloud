import vueJsx from "@vitejs/plugin-vue-jsx";
import { createRequire } from "node:module";
import path from "node:path";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

import { version } from "./package.json";

const require = createRequire(import.meta.url);
const mapPluginsRequire = createRequire(require.resolve("@ghcloud/cube-map-plugins/package.json"));
const resolveMapDependency = (packageName: string): string => path.dirname(mapPluginsRequire.resolve(`${packageName}/package.json`));

const projectName = "emergency-dispatch";

const config = defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";

  return {
    plugins: [vueJsx(), createHtmlPlugin({ inject: { data: { version } } }), qiankun(projectName, { useDevMode: true })],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: ['@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";'],
          modifyVars: {
            "@cube-ui-prefix": projectName,
            "@ant-prefix": projectName,
            "@root-entry-name": "variable",
            "@cube-theme-antd3-prefix": projectName,
            "@cube-theme-antd3-scope-selector": "#EmergencyDispatch",
          },
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        leaflet: resolveMapDependency("leaflet"),
        "leaflet-rotate": resolveMapDependency("leaflet-rotate"),
        "leaflet.chinatmsproviders": resolveMapDependency("leaflet.chinatmsproviders"),
        "leaflet-polylinedecorator": resolveMapDependency("leaflet-polylinedecorator"),
        "leaflet.markercluster": resolveMapDependency("leaflet.markercluster"),
        "leaflet.heat": resolveMapDependency("leaflet.heat"),
      },
      dedupe: ["leaflet"],
    },
    base: publicPath,
    define: {
      __ENV__: JSON.stringify({
        applicationCode: "emergency-dispatch",
      }),
    },
  };
});

export async function getBaseConfig(env: ConfigEnv): Promise<UserConfig> {
  return typeof config === "function" ? config(env) : config;
}
