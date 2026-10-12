import { defineConfig } from "vite";

import { getBaseConfig } from "./vite.config";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port: 8888,
      origin: "http://localhost:8888",
      headers: {
        "Accsee-Control-Allow-Origin": "*",
      },
      proxy: {
        "^/gw-bff": {
          target: "https://cube-test.guhecloud.com:30000",
          changeOrigin: true,
        },
        "^/api": {
          target: "https://sn-tj.guheyun.cn:40201/api",
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
