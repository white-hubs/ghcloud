import { defineConfig } from "vite";

import { getBaseConfig } from "./vite.config";

/**
 * Dev 默认开启 mock（见 vite.config.ts 的 `__ENV__.mock`）。
 * 关闭方式：设置 `.env.dev` 中 `VITE_USE_MOCK=false`。
 * `.env.dev` 已被 .gitignore，不会提交。
 */
export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port: 8888,
    },
  };
});
