import { defineConfig } from "vite";

import { getBaseConfig } from "./vite.config";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  const port = 8888;
  /** 与 scada-studio 默认 static 对齐：`public/builtin-elements/manifest.json` 根路径即为 `/builtin-elements/…` */
  const scadaStudioStaticTarget = "http://localhost:8899";

  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port: port,
      origin: `http://localhost:${port}`,
      proxy: {
        /** 设备监测页默认 `elementAssetBase` 为 `/resource/v1/scada-studio`，转发到本机 scada-studio 静态资源 */
        "/resource/v1/scada-studio": {
          target: scadaStudioStaticTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/resource\/v1\/scada-studio/, ""),
        },
      },
    },
  };
});
