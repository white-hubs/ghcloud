import { defineConfig } from "vite";

import { getBaseConfig } from "./vite.config";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port: 8892,
      origin: "http://localhost:8892",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      proxy: {
        "^/gw-bff": {
          target: "https://cube-test.guhecloud.com:3000/",
          changeOrigin: true,
        },
        "^/api": {
          target: "https://cube-test.guhecloud.com:3000/api",
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
