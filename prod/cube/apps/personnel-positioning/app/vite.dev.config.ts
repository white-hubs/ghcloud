import { defineConfig } from "vite";

import { getBaseConfig } from "./vite.config";

export default defineConfig(async (configEnv) => ({
  ...(await getBaseConfig(configEnv)),
  server: { host: "0.0.0.0", port: 8888, strictPort: true, cors: true, origin: "http://localhost:8888" },
}));
