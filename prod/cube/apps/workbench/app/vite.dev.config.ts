import { defineConfig } from "vite";

import { getBaseConfig } from "./vite.config";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port: 8888,
      origin: "http://localhost:8888", //本地项目启动若需要查看图标需保证与本地启动端口一致
    },
  };
});
