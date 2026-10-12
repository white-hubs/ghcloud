import { defineConfig, loadEnv } from "vite";

import { getBaseConfig } from "./vite.config";

const DEFAULT_DEV_PROXY_TARGET = "https://ai-center-prebuilt.cube-ai-project.orb.local/";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  const env = loadEnv(configEnv.mode, process.cwd(), "");
  const baseURL = env.VITE_BASE_API ?? "https://cube.guhecloud.com:3000/api";
  const devProxyTarget = (env.DEV_PROXY_TARGET?.trim() || DEFAULT_DEV_PROXY_TARGET).replace(/\/?$/, "/");
  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port: 8098,
      origin: "http://localhost:8098",
      open: false,
      fs: {
        allow: ["..", "../../..", "../../../..", "../../../../..", "../../../../../.."],
      },
      proxy: {
        "^/minio": {
          target: baseURL.replace("/api", ""),
          changeOrigin: true,
        },
        "^/resource": {
          // target: baseURL.replace("/api", ""),
          target: "http://192.168.0.243:40201",
          changeOrigin: true,
        },
        "/apps/@ghcloud/cube-ai-application-app": {
          target: baseURL.replace("/api", ""),
          changeOrigin: true,
          secure: false,
        },
        "/apps/@ghcloud/cube-alarm-modal": {
          target: baseURL.replace("/api", ""),
          changeOrigin: true,
          secure: false,
        },
        "/api/ai-center": {
          target: devProxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path: string) => path.replace(/^\/api\/ai-center/, ""),
        },
        "^/gw-bff": {
          target: baseURL.replace(/\/api\/?$/, ""),
          changeOrigin: true,
          ws: true,
        },
        "^/api": {
          target: baseURL,
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
