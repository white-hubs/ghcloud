import path from "node:path";
import { defineConfig } from "vite";

import { getBaseConfig } from "./vite.config";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  return {
    ...baseConfig,
    server: {
      ...baseConfig.server,
      cors: true,
      host: "0.0.0.0",
      port: 8888,
      strictPort: true,
      fs: {
        allow: [path.resolve(__dirname, "../../..")],
      },
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
