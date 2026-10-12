import vuePlugin from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { createRequire } from "node:module";
import path from "path";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";
import pugPlugin from "vue-pug-plugin";

import pkg from "./package.json";

const envs = {
  dev: {
    publicPath: "/apps-legacy/generic-equipment-monitor-migrate",
  },
  test: {
    publicPath: "/apps-legacy/generic-equipment-monitor-migrate",
  },
  prod: {
    publicPath: "/apps-legacy/generic-equipment-monitor-migrate",
  },
  /** vite build 默认 mode */
  production: {
    publicPath: "/apps-legacy/generic-equipment-monitor-migrate",
  },
};
const cubeScadaRoot = path.resolve(__dirname, "../../prod/cube/scada/basic");
const require = createRequire(import.meta.url);
const mapPluginsRequire = createRequire(require.resolve("@ghcloud/cube-map-plugins/package.json"));
const resolveMapDependency = (packageName: string): string => path.dirname(mapPluginsRequire.resolve(`${packageName}/package.json`));
const optimizeDependencyAliasPlugin = {
  name: "resolve-bun-cache-peer-deps",
  setup(build) {
    build.onResolve({ filter: /^leaflet$/ }, () => ({
      path: mapPluginsRequire.resolve("leaflet"),
    }));
    build.onResolve({ filter: /^tslib$/ }, () => ({
      path: require.resolve("tslib/tslib.es6.js"),
    }));
  },
};

const config = await defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = envs[mode].publicPath ?? "/";
  const projectName = pkg.name.replace("@ghcloud-legacy/", "");
  const containerId = `#${env.VITE_CONTAINER_ID}`;
  return {
    plugins: [
      vuePlugin({
        template: {
          preprocessOptions: {
            plugins: [pugPlugin],
          },
        },
      }),
      vueJsx(),
      createHtmlPlugin({
        inject: {
          data: {
            version: pkg.version,
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
          additionalData: [
            '@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";@import "@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/base.less";',
          ],
          modifyVars: {
            "@ant-prefix": projectName,
            "@root-entry-name": "variable",
            "@cube-theme-antd3-prefix": projectName,
            "@cube-theme-antd3-scope-selector": containerId,
          },
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@cube-scada/core": path.resolve(cubeScadaRoot, "core/src/index.ts"),
        "@cube-scada/elements": path.resolve(cubeScadaRoot, "elements/src/index.ts"),
        "@cube-scada/engine": path.resolve(cubeScadaRoot, "engine/src/index.ts"),
        "@cube-scada/renderer": path.resolve(cubeScadaRoot, "renderer/src/index.ts"),
        "@cube-scada/runtime": path.resolve(cubeScadaRoot, "runtime/src/index.ts"),
        "@cube-scada/studio-sdk": path.resolve(cubeScadaRoot, "studio-sdk/src/index.ts"),
        "~basscss": path.resolve(__dirname, "./node_modules/basscss"),
        /** workspace 包未发布 dist 时指向源码，供线损拓扑只读渲染 */
        "@ghcloud/cube-graph-editor-electrical": path.resolve(
          __dirname,
          "../../prod/cube/basic/cube-graph-editor-basic/cube-graph-editor-electrical/src/index.ts",
        ),
        "@ghcloud/cube-graph-editor-core": path.resolve(
          __dirname,
          "../../prod/cube/basic/cube-graph-editor-basic/cube-graph-editor-core/src/index.ts",
        ),
        leaflet: resolveMapDependency("leaflet"),
        "leaflet-rotate": resolveMapDependency("leaflet-rotate"),
        "leaflet.chinatmsproviders": resolveMapDependency("leaflet.chinatmsproviders"),
        "leaflet-polylinedecorator": resolveMapDependency("leaflet-polylinedecorator"),
        "leaflet.markercluster": resolveMapDependency("leaflet.markercluster"),
        "leaflet.heat": resolveMapDependency("leaflet.heat"),
        tslib: require.resolve("tslib/tslib.es6.js"),
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
      /**
       * > String 值会以原始表达式形式使用，所以如果定义了一个字符串常量，它需要被显式地打引号。（例如使用 `JSON.stringify`）
       *
       * [参考](https://cn.vitejs.dev/config/shared-options.html#define)
       */
      __CONTAINER_ID__: JSON.stringify(containerId),
      __PUBLIC_PATH__: JSON.stringify(publicPath),
    },
  };
});

export async function getBaseConfig(env: ConfigEnv): Promise<UserConfig> {
  if (typeof config === "function") {
    return config(env);
  }
  return config;
}
