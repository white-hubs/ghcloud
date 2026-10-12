import path from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "./src/main.ts"),
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "main.mjs" : "main.cjs"),
    },
    outDir: path.resolve(__dirname, "./dist"),
    sourcemap: false,
    minify: false,
    rollupOptions: {
      external: ["@ghcloud/cube-gateway", "@ghcloud/cube-protocol", "@ghcloud/cube-utils", "@ghcloud/epp"],
    },
  },
});
