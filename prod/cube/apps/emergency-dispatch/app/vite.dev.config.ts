import { defineConfig } from "vite";

import { getBaseConfig } from "./vite.config";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port: 8888,
      proxy: {
        "^/minio": {
          target: "http://192.168.0.133:40201/minio",
          changeOrigin: true,
          rewrite: (proxyPath: string) => proxyPath.replace(/^\/minio/, ""),
        },
      },
    },
  };
});
