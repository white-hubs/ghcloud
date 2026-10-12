import vueJsx from "@vitejs/plugin-vue-jsx";
import { createRequire } from "node:module";
import path from "path";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";

const require = createRequire(import.meta.url);
const echartsEsmPath = path.join(path.dirname(require.resolve("echarts/package.json")), "dist/echarts.esm.js");
/** @cube-ai/agent-sdk-client-vue 等 peer vue 的包可能解析到另一份 vue，prod 打包后 ref/watch 跨副本失效 */
const vueDir = path.dirname(require.resolve("vue/package.json"));
const vueRouterDir = path.dirname(require.resolve("vue-router/package.json"));
/** icons-vue 嵌套的 @ant-design/colors 在 Rolldown 下无法解析同级缺失的 @ctrl/tinycolor，改从 ant-design-vue 依赖树定位 */
const requireFromAntDesignVue = createRequire(require.resolve("ant-design-vue/package.json"));
const tinycolorDir = path.dirname(requireFromAntDesignVue.resolve("@ctrl/tinycolor/package.json"));
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

import { version } from "./package.json";

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  const projectName = "ai-application";
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
            "@cube-theme-antd3-scope-selector": "#AiApplicationApp",
          },
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        vue: vueDir,
        "vue-router": vueRouterDir,
        "@ctrl/tinycolor": tinycolorDir,
        tslib: path.dirname(require.resolve("tslib/package.json")),
        "@": path.resolve(__dirname, "./src"),
        "@ghcloud/cube-ai-application-service": path.resolve(__dirname, "../service/src/main.ts"),
        /** 运行时裸说明符指向完整 ESM 单文件，避免拆包丢失 GridComponent；`import type` 仍走包 types */
        echarts: echartsEsmPath,
      },
      dedupe: ["vue", "vue-router", "pinia", "echarts", "zrender"],
    },
    base: publicPath,
    define: {
      __ENV__: {
        applicationCode: "AI_APPLICATION",
      },
    },
    optimizeDeps: {
      /** 禁止预构建 echarts：.vite/deps/echarts.js 在浏览器中与 registerPreprocessor 不同步 */
      exclude: ["echarts", "zrender"],
    },
  };
});

export async function getBaseConfig(env: ConfigEnv): Promise<UserConfig> {
  if (typeof config === "function") {
    return config(env);
  }
  return config;
}
