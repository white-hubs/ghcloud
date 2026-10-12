import { defineConfig, loadEnv } from "vite";

import { getBaseConfig } from "./vite.config";

/** 本应用业务数据固定来自本地 Mock，仅保留端口配置供独立运行使用。 */
export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  const env = loadEnv(configEnv.mode, process.cwd(), "");
  const port = Number(env.VITE_DEV_PORT ?? 8888);
  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port,
      origin: `http://localhost:${port}`,
    },
  };
});
