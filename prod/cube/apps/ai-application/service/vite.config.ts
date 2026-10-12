import path from "node:path";
import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";

import { deepEntries } from "@ghcloud/vite-utils/lib/module";

export default defineConfig(() => {
  const srcDir = path.resolve(__dirname, "./src");
  const entries = Object.fromEntries(
    Object.entries(deepEntries(srcDir)).filter(([entryName]) => !entryName.endsWith(".test") && !entryName.endsWith(".spec")),
  );

  return {
    plugins: [dtsPlugin()],
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: "chunks/[name].js",
        },
      },
      lib: {
        entry: entries,
        formats: ["es"],
        fileName: (_format, entryName) => `${entryName}.js`,
      },
      outDir: path.resolve(__dirname, "./lib"),
    },
    resolve: {
      alias: {
        "@ghcloud/cube-ai-application-service": path.resolve(__dirname, "./src"),
      },
    },
  };
});
