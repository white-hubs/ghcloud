import { defineConfig, loadEnv } from "vite";

import { getBaseConfig } from "./vite.config";

/**
 * 预览 dist-preview（build:preview），供 qiankun 主壳联调。
 *
 * 用法：
 *   bun run build:preview
 *   bun run preview:local
 *
 * 主壳 entry（PUBLIC_PATH 已 bake 为 localhost:8890 绝对路径）：
 *   http://localhost:8890/apps/@ghcloud/cube-ai-application-app/
 *
 * API 仍走主壳同域 `/api/...`；preview server 开 CORS 供主壳跨域拉 JS/CSS。
 * 非 localhost 访问 preview 时可在 `.env.local` 覆盖：
 *   VITE_PREVIEW_ORIGIN=http://192.168.x.x:8890
 */
export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  const env = loadEnv(configEnv.mode, process.cwd(), "");
  const previewPort = Number(env.VITE_PREVIEW_PORT ?? 8890);
  const previewOrigin = env.VITE_PREVIEW_ORIGIN ?? `http://localhost:${previewPort}`;

  return {
    ...baseConfig,
    build: {
      outDir: "dist-preview",
    },
    preview: {
      host: "0.0.0.0",
      port: previewPort,
      strictPort: true,
      cors: true,
      origin: previewOrigin,
    },
  };
});
