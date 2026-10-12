import { defineConfig } from "vite";
import { loadEnv } from "vite";

import { getBaseConfig } from "./vite.config";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  const env = loadEnv(configEnv.mode, process.cwd(), "");
  const port = 9999;
  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port: port,
      origin: `http://localhost:${port}`,
      proxy: {
        "/api": {
          target: "http://192.168.0.243:30101/api",
          // target:'https://sat-test-admin.guhecloud.com:30000/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/gw-bff": {
          target: "http://192.168.0.243:30101/",
          changeOrigin: true,
        },
      },
    },
  };
});
