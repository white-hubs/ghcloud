import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { createRequire } from "node:module";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

import { version } from "./package.json";

const require = createRequire(import.meta.url);
const leafletPath = path.dirname(require.resolve("leaflet/package.json"));

const optimizeDependencyAliasPlugin = {
  name: "resolve-bun-cache-peer-deps",
  setup(build: { onResolve: (options: { filter: RegExp }, callback: () => { path: string }) => void }) {
    build.onResolve({ filter: /^leaflet$/ }, () => ({
      path: require.resolve("leaflet"),
    }));
  },
};

/** 与 config.js microApps[].name 一致 */
const QIANKUN_APP_NAME = "personalManagement";
const DEFAULT_PUBLIC_PATH = "/apps-legacy/person-management";

const ignoreResourcePaths = () => ({
  name: "ignore-resource-paths",
  resolveId(id: string) {
    if (id.startsWith("/resource/v1/")) {
      return { id, external: true };
    }
    return null;
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH?.trim() || DEFAULT_PUBLIC_PATH;
  const projectName = "legacy-person";
  const containerId = `#${env.VITE_CONTAINER_ID || "personalManagement"}`;

  return {
    plugins: [
      vue(),
      createHtmlPlugin({
        inject: {
          data: {
            version,
            VITE_CONTAINER_ID: env.VITE_CONTAINER_ID || "personalManagement",
          },
        },
      }),
      qiankun(QIANKUN_APP_NAME, {
        useDevMode: true,
      }),
      ignoreResourcePaths(),
      vueJsx(),
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
    base: publicPath,
    define: {
      __PUBLIC_PATH__: JSON.stringify(publicPath),
      __CONTAINER_ID__: JSON.stringify(containerId),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        leaflet: leafletPath,
      },
      dedupe: ["leaflet"],
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [optimizeDependencyAliasPlugin],
      },
    },
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: "assets/[hash].js",
          assetFileNames: "assets/[hash].[ext]",
          entryFileNames: "assets/[hash].js",
        },
      },
    },
    server: {
      host: "0.0.0.0",
      origin: "http://localhost:3200",
      port: 3200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      open: true,
      hmr: true,
      proxy: {
        "/api": {
          target: "http://192.168.2.169:3200/api",
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(/^\/api/, ""),
        },
      },
    },
    preview: {
      host: "0.0.0.0",
      port: 5050,
    },
  };
});
