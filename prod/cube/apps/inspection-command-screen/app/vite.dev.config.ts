import { defineConfig, loadEnv } from "vite";

import { getBaseConfig } from "./vite.config";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  const env = loadEnv(configEnv.mode, process.cwd(), "");
  const proxyTarget = env.VITE_PROXY_TARGET ?? "http://192.168.0.243:40201/api";
  const proxyOrigin = proxyTarget.replace(/\/api\/?$/, "");
  const resourceProxyOrigin = (env.VITE_RESOURCE_PROXY_TARGET ?? proxyOrigin).replace(/\/resource\/?$/, "");
  const devPort = Number(env.VITE_DEV_PORT ?? 8888);

  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port: devPort,
      origin: `http://localhost:${devPort}`,
      proxy: {
        "^/gw-bff": {
          target: proxyOrigin,
          changeOrigin: true,
          ws: true,
        },
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/resource": {
          target: resourceProxyOrigin,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
