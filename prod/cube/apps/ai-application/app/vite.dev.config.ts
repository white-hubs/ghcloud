import { createRequire } from "node:module";
import path from "node:path";
import { defineConfig, loadEnv, searchForWorkspaceRoot } from "vite";

import { getBaseConfig } from "./vite.config";

const require = createRequire(import.meta.url);
const fontsourceInterDir = path.dirname(require.resolve("@fontsource/inter/package.json"));

const DEFAULT_DEV_PROXY_TARGET = "http://192.168.0.243:13145/";

/** 与根 package.json `catalogs.cube-ai` 的 file: 链接目录一致（ghcloud 与 cube-ai-project 同级） */
const CUBE_AI_PROJECT_ROOT = path.resolve(__dirname, "../../../../../../cube-ai-project");

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  const env = loadEnv(configEnv.mode, process.cwd(), "");
  const devProxyTarget = (env.DEV_PROXY_TARGET?.trim() || DEFAULT_DEV_PROXY_TARGET).replace(/\/?$/, "/");
  console.log("devProxyTarget", devProxyTarget);
  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port: 8890,
      origin: "http://localhost:8890",
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd()), fontsourceInterDir, CUBE_AI_PROJECT_ROOT],
      },
      /** 主壳（qiankun mf-root）跨域请求本子应用 dev server 时需要（例如把 assistant 指到 `http://localhost:8890/api/ai-center/agent`） */
      cors: true,
      proxy: {
        /**
         * qiankun 注意：子应用挂在 mf-root 下时，浏览器里 `fetch('/api/...')` 的
         * 相对 URL 解析到**主壳域名**，不会命中本 dev server 的 proxy。联调本地
         * ai-center 请在 `.env.dev` 设置 `VITE_AI_CENTER_API_BASE`（见
         * `src/views/assistant/assistant-chat.tsx` 头注释），指向 OrbStack ai-center 或
         * `http://localhost:8890/api/ai-center`（assistant 用 `${base}/agent`）。
         * 网关代理上游在 `.env` / `.env.dev` 设置 `DEV_PROXY_TARGET`（默认
         * `http://192.168.0.133:13145/`）。
         *
         * Assistant 图表流式调试：
         *   `VITE_ASSISTANT_UNCLOSED_CHART_FENCE_MODE=placeholder`（默认）
         *     未闭合的 ```echarts / ```mermaid 显示占位，等 fence 闭合后再渲染。
         *   `VITE_ASSISTANT_UNCLOSED_CHART_FENCE_MODE=code`
         *     未闭合前按普通代码块渲染，方便查看模型正在输出什么。
         */
        "/api/ai-center": {
          target: devProxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path: string) => path.replace(/^\/api\/ai-center/, ""),
        },
        "/api": {
          target: devProxyTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path: string) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
