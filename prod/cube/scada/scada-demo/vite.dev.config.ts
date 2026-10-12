import { defineConfig, loadEnv } from "vite";

import { getBaseConfig } from "./vite.config";

/** 与 iot-center app 一致，开发时将 `/api` 转到网关，否则 `/api/device-center/...` 无法命中后端 */
export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  const env = loadEnv(configEnv.mode, process.cwd(), "");
  const apiProxyTarget = env.VITE_DEV_API_PROXY ?? "http://192.168.0.233:40201/";
  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port: 8898,
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        "/scada/api": {
          target: "http://localhost:3100",
          changeOrigin: true,
        },
      },
    },
  };
});
