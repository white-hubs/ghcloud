import { defineConfig, loadEnv } from "vite";

import { getBaseConfig } from "./vite.config";

const DEFAULT_DEV_PROXY_TARGET = "https://cube-test.guhecloud.com:30000";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  const env = loadEnv(configEnv.mode, process.cwd(), "");
  const devProxyTarget = env.VITE_DEV_PROXY_TARGET ?? DEFAULT_DEV_PROXY_TARGET;
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
          target: devProxyTarget,
          changeOrigin: true,
        },
        "^/api": {
          target: `${devProxyTarget}/api`,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
