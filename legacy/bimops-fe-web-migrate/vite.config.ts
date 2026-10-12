import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { createRequire } from "node:module";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import vitePluginCommonJS from "vite-plugin-commonjs";
import { createHtmlPlugin } from "vite-plugin-html";
import vitePluginResolveExternals from "vite-plugin-resolve-externals";

import { version } from "./package.json";
import vitePluginLessImport from "./vite-plugin/cube-legacy/less-import";

const require = createRequire(import.meta.url);
const vueDir = path.dirname(require.resolve("vue/package.json"));
const vueRouterDir = path.dirname(require.resolve("vue-router/package.json"));

const repoRoot = path.resolve(__dirname, "../..");
const aiApplicationAppRoot = path.resolve(repoRoot, "prod/cube/apps/ai-application/app");
const aiApplicationSrcRoot = path.resolve(aiApplicationAppRoot, "src");

/** ai-application 经 @ghcloud/cube-ai-application-app 打进 bimops 时，其源码里的 `@/` 应指向 ai-application/src，而非 bimops/src。 */
function vitePluginAiApplicationAlias() {
  return {
    name: "vite-plugin-ai-application-alias",
    enforce: "pre" as const,
    resolveId(source: string, importer: string | undefined) {
      if (!source.startsWith("@/") || !importer) {
        return null;
      }
      const file = path.normalize(importer.split("?")[0]!);
      if (!file.startsWith(path.normalize(aiApplicationAppRoot))) {
        return null;
      }
      return path.resolve(aiApplicationSrcRoot, source.slice(2));
    },
  };
}

const ignoreResourcePaths = () => ({
  name: "ignore-resource-paths",
  resolveId(id: string) {
    if (id.startsWith("/resource/v1/")) {
      return { id, external: true };
    }
    return null;
  },
});

//@ts-expect-error
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  console.log(`123123${env.VUE_APP_SERVICE_URL}`);
  return {
    plugins: [
      vitePluginAiApplicationAlias(),
      vitePluginLessImport(),
      vue(),
      vueJsx(),
      vitePluginCommonJS(),
      createHtmlPlugin({
        inject: {
          data: {
            version,
          },
        },
      }),
      vitePluginResolveExternals({}),
      ignoreResourcePaths(),
    ],

    build: {
      rollupOptions: {
        external: (id: string) => id.startsWith("/resource/v1/"),
        input: "./index.html",
        output: {
          chunkFileNames: "assets/[hash].js",
          assetFileNames: "assets/[hash].[ext]",
          entryFileNames: "assets/[hash].js",
        },
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          additionalData: [`@import "${path.resolve(__dirname, "src/styles/index.less")}";`],
          modifyVars: {
            "primary-color": "#1890ff",
            "link-color": "#1890ff",
            "@root-entry-name": "variable",
          },
          javascriptEnabled: true,
        },
      },
    },
    base: publicPath,
    resolve: {
      extensions: [".vue", ".js", ".jsx", ".json", ".tsx", ".ts"],
      alias: {
        vue: vueDir,
        "vue-router": vueRouterDir,
        "@": path.resolve(__dirname, "./src"),
        "@ghcloud/cube-ai-application-app": path.resolve(aiApplicationAppRoot, "src/public.ts"),
        "@ghcloud/cube-ai-application-service": path.resolve(aiApplicationAppRoot, "../service/src/main.ts"),
      },
      dedupe: ["vue", "vue-router", "pinia"],
    },
    preview: {
      port: 5050,
    },
    optimizeDeps: {
      include: ["dayjs/locale/zh-cn"],
    },
    server: {
      https: false,
      host: "0.0.0.0",
      port: 5174,
      origin: "http://localhost:5174",
      fs: {
        allow: [repoRoot],
      },
      proxy: {
        "/api": {
          target: env.VUE_APP_SERVICE_URL,
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/gw-bff": {
          target: env.VUE_APP_SERVICE_URL?.replace(/\/api\/?$/, ""),
          // target: "http://192.168.4.119:3000",
          changeOrigin: true,
          ws: true,
        },
        "/resource": {
          target: env.VUE_APP_DOMAIN_URL,
          changeOrigin: true,
          ws: true,
        },
        "/minio": env.VUE_APP_DOMAIN_URL,
        "/apps/todo-center/app": {
          target: env.VUE_APP_SERVICE_URL.replace("/api", ""),
          changeOrigin: true,
          secure: false,
        },
        "/apps-legacy/person-management": {
          target: "http://localhost:3200",
          changeOrigin: true,
          secure: false,
        },
        "/apps/@ghcloud/cube-alarm-modal": {
          target: env.VUE_APP_SERVICE_URL.replace("/api", ""),
          changeOrigin: true,
          secure: false,
        },
        "/apps/@ghcloud/cube-ai-application-app": {
          target: env.VUE_APP_SERVICE_URL.replace("/api", ""),
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
