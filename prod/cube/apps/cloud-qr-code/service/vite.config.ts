import { deepEntries } from "@ghcloud/vite-utils/lib/module";
import path from "node:path";
import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";

export default defineConfig(() => ({
  plugins: [dtsPlugin()],
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: "chunks/[name].js",
      },
    },
    lib: {
      entry: deepEntries(path.resolve(__dirname, "./src")),
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    outDir: path.resolve(__dirname, "./lib"),
  },
  resolve: {
    alias: {
      "@ghcloud/cube-ghcloud-cloud-qr-code-service": path.resolve(__dirname, "./src"),
    },
  },
}));
