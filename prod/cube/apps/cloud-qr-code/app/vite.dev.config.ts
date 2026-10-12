import { getBaseConfig } from "./vite.config";
import { defineConfig } from "vite";

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port: 8889,
    },
  };
});
