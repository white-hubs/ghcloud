import { defineConfig } from "vite";

import { getBaseConfig } from "./vite.config";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  return {
    ...baseConfig,
    server: {
      cors: true,
      port: 9000,
      proxy: {
        "/api": {
          target: "http://192.168.0.243:30101/api",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/gw-bff": {
          target: "http://192.168.4.119:3000",
          changeOrigin: true,
        },
      },
    },
  };
});
