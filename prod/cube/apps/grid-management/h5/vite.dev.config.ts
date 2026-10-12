import { getBaseConfig } from "./vite.config";
import { defineConfig } from "vite";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
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
          target: "https://cube-test.guhecloud.com:30000/api",
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ""),
        },
        "^/resource": {
          target: "https://cube-test.guhecloud.com:30000/resource",
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/resource/, ""),
        },
        "^/minio": {
          target: "https://cube-test.guhecloud.com:30000/minio",
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/minio/, ""),
        },
      },
    },
  };
});
