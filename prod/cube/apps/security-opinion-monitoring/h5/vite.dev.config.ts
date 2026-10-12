import { defineConfig } from "vite";

import { getBaseConfig } from "./vite.config";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port: 8891,
      origin: "http://localhost:8891",
      proxy: {
        "^/gw-bff": {
          target: "http://127.0.0.1:3000",
          changeOrigin: true,
        },
        "^/api": {
          target: "https://cube-dev.guhecloud.com:30000/api",
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
