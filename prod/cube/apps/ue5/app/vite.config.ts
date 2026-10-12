import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { createRequire } from "node:module";
import path from "path";
import postCssPxToRem from "postcss-pxtorem";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";

import { version } from "./package.json";

const require = createRequire(import.meta.url);
const vueDir = path.dirname(require.resolve("vue/package.json"));
const vueRouterDir = path.dirname(require.resolve("vue-router/package.json"));

const projectName = "ue5";
const repoRoot = path.resolve(__dirname, "../../../../../");
const aiApplicationAppRoot = path.resolve(repoRoot, "prod/cube/apps/ai-application/app");
const aiApplicationSrcRoot = path.resolve(aiApplicationAppRoot, "src");

/** ai-application 源码打进 ue5 时，其 `@/` 应指向 ai-application/src */
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

const ignoreResourcePaths = () => ({
  name: "ignore-resource-paths",
  resolveId(id: string) {
    if (id.startsWith("/resource/v1/")) {
      return { id, external: true };
    }
    return null;
  },
});

const config = defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/apps/ue5";

  return {
    plugins: [
      vitePluginAiApplicationAlias(),
      vue(),
      vueJsx(),
      ignoreResourcePaths(),
      createHtmlPlugin({
        inject: {
          data: { version, ...env, publicPath },
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
            "@cube-theme-antd3-scope-selector": "#Ue5",
            "primary-color": "#2989FF",
            "link-color": "#2989FF",
            "border-radius-base": "2px",
            "border-color-base": "#2989FF",
          },
          javascriptEnabled: true,
        },
      },
      postcss: {
        plugins: [
          postCssPxToRem({
            rootValue: 192,
            propList: ["*"],
            // Boot splash must stay physical px: rem root is applied slightly later and
            // would otherwise flash unreadable ~2–4px copy before viewport metrics run.
            selectorBlackList: [/#ue5-boot-loader/, /\.ue5-boot-loader/],
          }),
        ],
      },
    },
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
      entries: ["index.html"],
      include: ["vue", "vue-router", "pinia", "ant-design-vue"],
    },
    assetsInclude: ["**/*.HDR", "**/*.hdr"],
    base: publicPath,
    define: {
      __ENV__: {
        applicationCode: "three-dimensional-visualization",
        mock: false,
      },
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        external: (id) => id.startsWith("/resource/v1/"),
        output: {
          chunkFileNames: "assets/[hash].js",
          assetFileNames: "assets/[hash].[ext]",
          entryFileNames: "assets/[hash].js",
        },
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

export default config;
