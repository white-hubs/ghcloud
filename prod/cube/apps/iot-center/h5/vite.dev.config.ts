import { getBaseConfig } from "./vite.config";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  const env = loadEnv(configEnv.mode, process.cwd(), "");
  /**
   * 与 legacy/generic-equipment-monitor-migrate/vite.dev.config.ts 一致：
   * `elementAssetBase` 默认 `/resource/v1/scada-studio`，转发到本机 scada-studio 静态（默认 :8899）。
   */
  const scadaStudioStaticTarget = env.VITE_DEV_SCADA_STUDIO_STATIC_TARGET ?? "http://localhost:8899";
  /** 组态 REST：与 PC 网关一致；本地直连 scada BFF 可设 VITE_DEV_SCADA_API_PROXY=http://localhost:3100 */
  const scadaApiTarget = env.VITE_DEV_SCADA_API_PROXY ?? "http://192.168.0.243:40201";
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
        /** 必须写在泛化 `/resource` 之前，否则组态静态会走错目标 */
        "/resource/v1/scada-studio": {
          target: scadaStudioStaticTarget,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/resource\/v1\/scada-studio/, ""),
        },
        "^/api": {
          target: "http://192.168.0.243:40201/api",
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ""),
        },
        "/resource": "http://192.168.0.133:40201",
        "/scada/api": {
          target: scadaApiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
