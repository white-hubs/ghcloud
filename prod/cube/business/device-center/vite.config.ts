import vuePlugin from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import type { Plugin as EsbuildPlugin } from "esbuild";
import { createRequire } from "node:module";
import path from "path";
import { presetUno, presetAttributify, presetIcons } from "unocss";
import Unocss from "unocss/vite";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

import { version } from "./package.json";

const require = createRequire(import.meta.url);
const genericComponentRequire = createRequire(require.resolve("@ghcloud/generic-component/package.json"));
const mapPluginsRequire = createRequire(genericComponentRequire.resolve("@ghcloud/cube-map-plugins/package.json"));
const resolveMapDependency = (packageName: string): string => path.dirname(mapPluginsRequire.resolve(`${packageName}/package.json`));
const optimizeDependencyAliasPlugin: EsbuildPlugin = {
  name: "resolve-bun-cache-peer-deps",
  setup(build) {
    build.onResolve({ filter: /^leaflet$/ }, () => ({
      path: mapPluginsRequire.resolve("leaflet"),
    }));
  },
};

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  const projectName = "device-center";
  return {
    plugins: [
      vuePlugin(),
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
      Unocss({
        // 使用Unocss
        presets: [presetUno(), presetAttributify(), presetIcons()],
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: [
            '@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";',
            // '@import "@ghcloud/cube-ui/lib/style.css";',
          ],
          modifyVars: {
            "@cube-ui-prefix": projectName,
            "@ant-prefix": projectName,
            "@root-entry-name": "variable",
            "@cube-theme-antd3-prefix": projectName,
            "@cube-theme-antd3-scope-selector": "#DeviceCenterAPP",
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
    optimizeDeps: {
      esbuildOptions: {
        plugins: [optimizeDependencyAliasPlugin],
      },
    },
    base: publicPath,
    define: {
      __ENV__: {
        applicationCode: "DEVICECENTER",
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
