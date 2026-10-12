// vite.dev.config.ts
import { defineConfig as defineConfig2 } from "file:///Users/bi/code/ghcloud/node_modules/.pnpm/vite@4.5.1_@types+node@20.9.0_less@4.2.0_terser@5.31.0/node_modules/vite/dist/node/index.js";

// vite.config.ts
import vueJsx from "file:///Users/bi/code/ghcloud/node_modules/.pnpm/@vitejs+plugin-vue-jsx@3.1.0_vite@4.5.1_vue@3.3.9/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import path from "path";
import { defineConfig, loadEnv } from "file:///Users/bi/code/ghcloud/node_modules/.pnpm/vite@4.5.1_@types+node@20.9.0_less@4.2.0_terser@5.31.0/node_modules/vite/dist/node/index.js";
import eslintPlugin from "file:///Users/bi/code/ghcloud/node_modules/.pnpm/vite-plugin-eslint@1.8.1_eslint@8.53.0_vite@4.5.1/node_modules/vite-plugin-eslint/dist/index.mjs";
import qiankun from "file:///Users/bi/code/ghcloud/node_modules/.pnpm/vite-plugin-qiankun@1.0.15_typescript@5.3.2_vite@4.5.1/node_modules/vite-plugin-qiankun/dist/index.js";
var __vite_injected_original_dirname = "/Users/bi/code/ghcloud/prod/cube/business/visual-config";
var config = await defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  const projectName = "visual-config";
  return {
    plugins: [
      vueJsx(),
      // eslintPlugin({
      //   include: ["src/**/*.{ts,tsx}"]
      // }),
      qiankun(projectName, {
        useDevMode: true
      })
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: [
            '@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";'
          ],
          modifyVars: {
            "@cube-ui-prefix": projectName,
            "@ant-prefix": projectName,
            "@root-entry-name": "variable",
            "@cube-theme-antd3-prefix": projectName,
            "@cube-theme-antd3-scope-selector": "#SecureEduAPP"
          },
          javascriptEnabled: true
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    base: publicPath
  };
});
async function getBaseConfig(env) {
  if (typeof config === "function") {
    return config(env);
  }
  return config;
}

// vite.dev.config.ts
var vite_dev_config_default = defineConfig2(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  return {
    ...baseConfig,
    server: {
      host: "0.0.0.0",
      port: 8888,
      origin: "http://localhost:8888"
    }
  };
});
export {
  vite_dev_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5kZXYuY29uZmlnLnRzIiwgInZpdGUuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2JpL2NvZGUvZ2hjbG91ZC9wcm9kL2N1YmUvYnVzaW5lc3MvdmlzdWFsLWNvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2JpL2NvZGUvZ2hjbG91ZC9wcm9kL2N1YmUvYnVzaW5lc3MvdmlzdWFsLWNvbmZpZy92aXRlLmRldi5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2JpL2NvZGUvZ2hjbG91ZC9wcm9kL2N1YmUvYnVzaW5lc3MvdmlzdWFsLWNvbmZpZy92aXRlLmRldi5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHsgZ2V0QmFzZUNvbmZpZyB9IGZyb20gJy4vdml0ZS5jb25maWcnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhhc3luYyAoY29uZmlnRW52KSA9PiB7XG4gIGNvbnN0IGJhc2VDb25maWcgPSBhd2FpdCBnZXRCYXNlQ29uZmlnKGNvbmZpZ0VudilcbiAgcmV0dXJuIHtcbiAgICAuLi5iYXNlQ29uZmlnLFxuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogJzAuMC4wLjAnLFxuICAgICAgcG9ydDogODg4OCxcbiAgICAgIG9yaWdpbjogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODg4OCcsXG4gICAgfSxcbiAgfVxufSlcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2JpL2NvZGUvZ2hjbG91ZC9wcm9kL2N1YmUvYnVzaW5lc3MvdmlzdWFsLWNvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2JpL2NvZGUvZ2hjbG91ZC9wcm9kL2N1YmUvYnVzaW5lc3MvdmlzdWFsLWNvbmZpZy92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYmkvY29kZS9naGNsb3VkL3Byb2QvY3ViZS9idXNpbmVzcy92aXN1YWwtY29uZmlnL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4J1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IHR5cGUgQ29uZmlnRW52LCB0eXBlIFVzZXJDb25maWcsIGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgZXNsaW50UGx1Z2luIGZyb20gJ3ZpdGUtcGx1Z2luLWVzbGludCdcbmltcG9ydCBxaWFua3VuIGZyb20gJ3ZpdGUtcGx1Z2luLXFpYW5rdW4nXG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYXdhaXQtdGhlbmFibGVcbmNvbnN0IGNvbmZpZyA9IGF3YWl0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJylcbiAgY29uc3QgcHVibGljUGF0aCA9IGVudi5QVUJMSUNfUEFUSCA/PyAnLydcbiAgLy8gY29uc3QgcHVibGljUGF0aCA9ICcvJ1xuICBjb25zdCBwcm9qZWN0TmFtZSA9ICd2aXN1YWwtY29uZmlnJ1xuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtcbiAgICAgIHZ1ZUpzeCgpLFxuICAgICAgZXNsaW50UGx1Z2luKHtcbiAgICAgICAgaW5jbHVkZTogWydzcmMvKiovKi57dHMsdHN4fSddLFxuICAgICAgfSksXG4gICAgICBxaWFua3VuKHByb2plY3ROYW1lLCB7XG4gICAgICAgIHVzZURldk1vZGU6IHRydWUsXG4gICAgICB9KSxcbiAgICBdLFxuICAgIGNzczoge1xuICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgICBsZXNzOiB7XG4gICAgICAgICAgYWRkaXRpb25hbERhdGE6IFtcbiAgICAgICAgICAgICdAaW1wb3J0IFwiQGdoY2xvdWQvY3ViZS10aGVtZS9keW5hbWljLXN0eWxlL2FudGQzLXZhcmxhYmxlLmxlc3NcIjsnLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgbW9kaWZ5VmFyczoge1xuICAgICAgICAgICAgJ0BjdWJlLXVpLXByZWZpeCc6IHByb2plY3ROYW1lLFxuICAgICAgICAgICAgJ0BhbnQtcHJlZml4JzogcHJvamVjdE5hbWUsXG4gICAgICAgICAgICAnQHJvb3QtZW50cnktbmFtZSc6ICd2YXJpYWJsZScsXG4gICAgICAgICAgICAnQGN1YmUtdGhlbWUtYW50ZDMtcHJlZml4JzogcHJvamVjdE5hbWUsXG4gICAgICAgICAgICAnQGN1YmUtdGhlbWUtYW50ZDMtc2NvcGUtc2VsZWN0b3InOiAnI1NlY3VyZUVkdUFQUCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIGphdmFzY3JpcHRFbmFibGVkOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGJhc2U6IHB1YmxpY1BhdGgsXG4gIH1cbn0pXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRCYXNlQ29uZmlnIChlbnY6IENvbmZpZ0Vudik6IFByb21pc2U8VXNlckNvbmZpZz4ge1xuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBjb25maWcoZW52KVxuICB9XG4gIHJldHVybiBjb25maWdcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1YsU0FBUyxnQkFBQUEscUJBQW9COzs7QUNBckMsT0FBTyxZQUFZO0FBQzFXLE9BQU8sVUFBVTtBQUNqQixTQUEwQyxjQUFjLGVBQWU7QUFDdkUsT0FBTyxrQkFBa0I7QUFDekIsT0FBTyxhQUFhO0FBSnBCLElBQU0sbUNBQW1DO0FBT3pDLElBQU0sU0FBUyxNQUFNLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUM5QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFDM0MsUUFBTSxhQUFhLElBQUksZUFBZTtBQUV0QyxRQUFNLGNBQWM7QUFDcEIsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLE1BQ1AsYUFBYTtBQUFBLFFBQ1gsU0FBUyxDQUFDLG1CQUFtQjtBQUFBLE1BQy9CLENBQUM7QUFBQSxNQUNELFFBQVEsYUFBYTtBQUFBLFFBQ25CLFlBQVk7QUFBQSxNQUNkLENBQUM7QUFBQSxJQUNIO0FBQUEsSUFDQSxLQUFLO0FBQUEsTUFDSCxxQkFBcUI7QUFBQSxRQUNuQixNQUFNO0FBQUEsVUFDSixnQkFBZ0I7QUFBQSxZQUNkO0FBQUEsVUFDRjtBQUFBLFVBQ0EsWUFBWTtBQUFBLFlBQ1YsbUJBQW1CO0FBQUEsWUFDbkIsZUFBZTtBQUFBLFlBQ2Ysb0JBQW9CO0FBQUEsWUFDcEIsNEJBQTRCO0FBQUEsWUFDNUIsb0NBQW9DO0FBQUEsVUFDdEM7QUFBQSxVQUNBLG1CQUFtQjtBQUFBLFFBQ3JCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUN0QztBQUFBLElBQ0Y7QUFBQSxJQUNBLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQztBQUVELGVBQXNCLGNBQWUsS0FBcUM7QUFDeEUsTUFBSSxPQUFPLFdBQVcsWUFBWTtBQUNoQyxXQUFPLE9BQU8sR0FBRztBQUFBLEVBQ25CO0FBQ0EsU0FBTztBQUNUOzs7QURsREEsSUFBTywwQkFBUUMsY0FBYSxPQUFPLGNBQWM7QUFDL0MsUUFBTSxhQUFhLE1BQU0sY0FBYyxTQUFTO0FBQ2hELFNBQU87QUFBQSxJQUNMLEdBQUc7QUFBQSxJQUNILFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLFFBQVE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbImRlZmluZUNvbmZpZyIsICJkZWZpbmVDb25maWciXQp9Cg==
