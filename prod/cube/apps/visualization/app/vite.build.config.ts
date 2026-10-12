import { defineConfig } from "vite";

import { getBaseConfig } from "./vite.config";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  return {
    ...baseConfig,
    build: {
      sourcemap: configEnv.mode === "development",
      // 可视化 SDK（three / babylon / UE）体积较大；业务侧已做异步分包，此处仅抬高告警阈值
      chunkSizeWarningLimit: 15000,
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
