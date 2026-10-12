import { getBaseConfig } from "./vite.config";
import { defineConfig } from "vite";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port: 8888,
      origin: "http://192.168.3.4:8888",
      headers: {
        "Accsee-Control-Allow-Origin": "*",
      },
      proxy: {
        "^/api": {
          target: "http://10.125.10.244:40201/api",
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ""),
        },
        "^/resource": {
          target: "http://192.168.0.133:40201/resource",
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/resource/, ""),
        },
      },
    },
  };
});
