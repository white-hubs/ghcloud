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

/**
 * Qiankun 项目名与主应用 `/portal/<slug>` 路径段必须一致。
 * 替换此处值 = 替换 `src/main.ts#mount` 的 `base` = 替换主应用菜单的 `path` 前缀。
 */
const projectName = "emergency-supplies";

const ignoreResourcePaths = () => {
  return {
    name: "ignore-resource-paths",
    resolveId(id: string) {
      if (id.startsWith("/resource/v1/")) {
        return { id, external: true };
      }
      return null;
    },
  };
};

const config = defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // 构建侧变量（非 VITE_ 前缀），所以 loadEnv 用空前缀
  // - PUBLIC_PATH 由 CI / nginx / 主应用部署配置按需覆盖，默认 `/`
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
      ignoreResourcePaths(),
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
            "@cube-theme-antd3-scope-selector": "#EmergencySupplies",
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
      __ENV__: {
        applicationCode: "EMERGENCY_SUPPLIES",
      },
    },
    build: {
      rollupOptions: {
        external: (id: string) => id.startsWith("/resource/v1/"),
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
