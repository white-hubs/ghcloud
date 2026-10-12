import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { createRequire } from "node:module";
import path from "path";
import postCssPxToRem from "postcss-pxtorem";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import viteCompression from "vite-plugin-compression";
import { createHtmlPlugin } from "vite-plugin-html";
import { viteMockServe } from "vite-plugin-mock";

import { version } from "./package.json";

const require = createRequire(import.meta.url);
const vueDir = path.dirname(require.resolve("vue/package.json"));
const vueRouterDir = path.dirname(require.resolve("vue-router/package.json"));

const repoRoot = path.resolve(__dirname, "../..");
const aiApplicationAppRoot = path.resolve(repoRoot, "prod/cube/apps/ai-application/app");
const aiApplicationSrcRoot = path.resolve(aiApplicationAppRoot, "src");

/** ai-application 经 @ghcloud/cube-ai-application-app 打进 ue5 时，其源码里的 `@/` 应指向 ai-application/src。 */
function vitePluginAiApplicationAlias() {
  return {
    name: "vite-plugin-ai-application-alias",
    enforce: "pre" as const,
    resolveId(source: string, importer: string | undefined) {
      if (!source.startsWith("@/") || !importer) return null;
      const file = path.normalize(importer.split("?")[0]!);
      if (!file.startsWith(path.normalize(aiApplicationAppRoot))) return null;
      return path.resolve(aiApplicationSrcRoot, source.slice(2));
    },
  };
}

// 插件：忽略 /resource/v1/ 路径的资源，让它们在运行时加载
const ignoreResourcePaths = () => ({
  name: "ignore-resource-paths",
  resolveId(id) {
    // 如果是 /resource/v1/ 开头的路径，标记为 external
    if (id.startsWith("/resource/v1/")) {
      return { id, external: true };
    }
    return null;
  },
});

const DEFAULT_DEV_PROXY_TARGET = "https://ai-center-prebuilt.cube-ai-project.orb.local/";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  const baseURL: string = env.VITE_BASE_API;
  const devProxyTarget = (env.DEV_PROXY_TARGET?.trim() || DEFAULT_DEV_PROXY_TARGET).replace(/\/?$/, "/");
  const projectName = "ue5-migrate";
  return {
    plugins: [
      vitePluginAiApplicationAlias(),
      vue(),
      vueJsx(),
      ignoreResourcePaths(), // 忽略 /resource/v1/ 路径
      createHtmlPlugin({
        inject: {
          data: {
            ...env,
            publicPath,
            version,
          },
        },
      }),
      viteMockServe({
        mockPath: "./src/mock/",
        localEnabled: false, // 是否开启开发环境
        prodEnabled: false, //是否开启生产环境
        watchFiles: true,
        injectCode: `import { setupProdMockServer } from './mockProdServer';
        setupProdMockServer();`,
        logger: true, //是否在控制台显示日志
      }),
      viteCompression(),
      // visualizer({
      //   open: true, // 打包完成后自动打开报告
      //   gzipSize: true, // 显示 gzip 压缩后的体积
      //   brotliSize: true, // 显示 brotli 压缩后的体积
      // }),
    ],
    resolve: {
      alias: {
        vue: vueDir,
        "vue-router": vueRouterDir,
        "@": path.resolve(__dirname, "./src"),
        "~@": path.resolve(__dirname, "./src"),
        "@ghcloud/cube-ai-application-app": path.resolve(aiApplicationAppRoot, "src/public.ts"),
        "@ghcloud/cube-ai-application-service": path.resolve(aiApplicationAppRoot, "../service/src/main.ts"),
      },
      dedupe: ["vue", "vue-router", "pinia"],
    },
    optimizeDeps: {
      esbuildOptions: {
        external: ["leaflet"],
      },
    },

    assetsInclude: ["**/*.HDR", "**/*.hdr"],
    base: publicPath,
    server: {
      host: "0.0.0.0",
      origin: "http://localhost:8098",
      port: 8098,
      headers: {
        "Accsee-Control-Allow-Origin": "*",
      },
      open: false,
      hmr: true,
      fs: {
        allow: [repoRoot],
      },
      proxy: {
        "^/minio": {
          target: baseURL.replace("/api", ""),
          changeOrigin: true,
        },
        "^/resource": {
          // target: baseURL.replace('/api',''),
          target: "http://192.168.0.243:40201",
          changeOrigin: true,
        },
        "/apps/@ghcloud/cube-alarm-modal": {
          target: baseURL.replace("/api", ""),
          changeOrigin: true,
          secure: false,
        },
        "/apps/@ghcloud/cube-ai-application-app": {
          target: baseURL.replace("/api", ""),
          changeOrigin: true,
          secure: false,
        },
        "^/api-dynamic-model-line": {
          target: "http://192.168.0.243:40201/api-dynamic-model-line",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-dynamic-model-line/, ""),
        },
        "^/gw-bff": {
          target: baseURL.replace(/\/api\/?$/, ""),
          changeOrigin: true,
          ws: true,
        },
        // 与 ai-application 一致：AI 中台走 DEV_PROXY_TARGET（须写在通用 ^/api 之前）
        "/api/ai-center": {
          target: devProxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path: string) => path.replace(/^\/api\/ai-center/, ""),
        },
        "^/api": {
          target: baseURL,
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    preview: {
      port: 5050,
    },

    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        external: (id) =>
          // 排除 /resource/v1/ 路径，让它们在运行时从静态服务器加载
          id.startsWith("/resource/v1/"),
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
          /**修改ant-design-vue主题色 */
          modifyVars: {
            "@ant-prefix": projectName,
            "@cube-theme-antd3-prefix": projectName,
            "primary-color": "#2989FF",
            "link-color": "#2989FF",
            "border-radius-base": "2px",
            "root-entry-name": "default",
            "border-color-base": "#2989FF",
          },
          javascriptEnabled: true,
        },
      },
      postcss: {
        plugins: [
          postCssPxToRem({
            rootValue: 192,
            propList: ["*"], //需要转化的属性
          }),
        ],
      },
    },
  };
});
