import { defineConfig } from "vite";

import { getBaseConfig } from "./vite.config";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port: 8899,
      origin: "http://localhost:8899",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      proxy: {
        "/api": {
          target: "https://cube-test.guhecloud.com:30000/",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
