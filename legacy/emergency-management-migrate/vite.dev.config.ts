import { defineConfig } from "vite";

import { getBaseConfig } from "./vite.config";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  const port = 8888;
  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port: port,
      origin: `http://localhost:${port}`,
    },
    "/gw-bff": {
      target: "http://192.168.4.138:30000/",
      changeOrigin: true,
    },
  };
});
