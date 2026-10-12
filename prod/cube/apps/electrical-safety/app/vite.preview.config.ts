import { defineConfig, loadEnv } from "vite";

import { getBaseConfig } from "./vite.config";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  const env = loadEnv(configEnv.mode, process.cwd(), "");
  const scadaStudioStaticTarget = env.VITE_DEV_SCADA_STUDIO_STATIC_TARGET ?? "http://localhost:8899";
  const scadaApiTarget = env.VITE_DEV_SCADA_API_PROXY ?? "http://192.168.0.243:40201";
  return {
    ...baseConfig,
    preview: {
      port: 9999,
      proxy: {
        "/resource/v1/scada-studio": {
          target: scadaStudioStaticTarget,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/resource\/v1\/scada-studio/, ""),
        },
        "/scada/api": {
          target: scadaApiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
