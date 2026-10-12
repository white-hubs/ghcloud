import fs from "fs";
import path from "path";
import { defineConfig } from "vite";

import { getBaseConfig } from "./vite.config";

const base64Cache = new Map<string, string>();

const ssgInlineAssetPlugin = () => ({
  name: "ssg-inline-asset",
  enforce: "pre" as const,
  load(id: string) {
    if (!id.includes("ssg-components")) return;

    const cleanId = id.replace("/@fs/", "");
    if (!cleanId.endsWith(".webp?url")) return;

    const filePath = cleanId.replace("?url", "");
    if (!fs.existsSync(filePath)) return;

    if (base64Cache.has(filePath)) {
      return base64Cache.get(filePath);
    }

    const data = fs.readFileSync(filePath);
    const base64 = data.toString("base64");
    const code = `export default "data:image/webp;base64,${base64}"`;
    base64Cache.set(filePath, code);
    return code;
  },
});

export default defineConfig(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  return {
    ...baseConfig,
    plugins: [...(baseConfig.plugins || []), ssgInlineAssetPlugin()],
    server: {
      host: "0.0.0.0",
      port: 8888,
      fs: {
        allow: [path.resolve(__dirname, "..")],
      },
      proxy: {
        "^/api": {
          target: "https://cube-dev.guhecloud.com:30000/api",
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
