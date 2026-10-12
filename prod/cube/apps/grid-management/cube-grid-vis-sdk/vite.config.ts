import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({ include: ['sdk'] })],
  build: {
    lib: {
      entry: resolve(__dirname, 'sdk/index.ts'),
      name: 'CubeGridVisSDK',
      fileName: 'cube-grid-vis-sdk',
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    open: '/test-html/index.html',
  }
});
