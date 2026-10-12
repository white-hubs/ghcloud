import { defineConfig } from "vite";

import { getBaseConfig } from "./vite.config";

/** 本地 qiankun preview 专用构建：输出 dist-preview，PUBLIC_PATH 见 .env.preview */
export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  return {
    ...baseConfig,
    build: {
      outDir: "dist-preview",
      emptyOutDir: true,
      rollupOptions: {
        output: {
          chunkFileNames: "assets/[hash].js",
          assetFileNames: "assets/[hash].[ext]",
          entryFileNames: "assets/[hash].js",
        },
      },
    },
  };
});
