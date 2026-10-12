import { defineConfig } from "vite";

import { getBaseConfig } from "./vite.config";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  const targetUrl = "https://safe.higreen-gm.com:30000/";
  // const targetUrl = 'https://cap2.cdhjx.cn/'
  // const targetUrl = 'http://192.168.0.243:40201'
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
        "^/api": {
          target: `${targetUrl}/api`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "^/config.js": {
          target: targetUrl,
          changeOrigin: true,
        },
        "/resource": targetUrl,
        "/minio": targetUrl,
      },
    },
  };
});
