// vite.dev.config.ts
import { defineConfig as defineConfig2 } from "file:///home/zee/Documents/code/ghcloud/node_modules/.pnpm/vite@4.3.9_@types+node@20.4.5_less@4.2.0/node_modules/vite/dist/node/index.js";

// vite.config.ts
import vueJsx from "file:///home/zee/Documents/code/ghcloud/node_modules/.pnpm/@vitejs+plugin-vue-jsx@3.0.2_vite@4.3.9_vue@3.3.4/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import vue from "file:///home/zee/Documents/code/ghcloud/node_modules/.pnpm/@vitejs+plugin-vue@4.3.4_vite@4.3.9_vue@3.3.4/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import { defineConfig, loadEnv } from "file:///home/zee/Documents/code/ghcloud/node_modules/.pnpm/vite@4.3.9_@types+node@20.4.5_less@4.2.0/node_modules/vite/dist/node/index.js";
import qiankun from "file:///home/zee/Documents/code/ghcloud/node_modules/.pnpm/vite-plugin-qiankun@1.0.15_typescript@5.2.2_vite@4.3.9/node_modules/vite-plugin-qiankun/dist/index.js";
import eslintPlugin from "file:///home/zee/Documents/code/ghcloud/node_modules/.pnpm/vite-plugin-eslint@1.8.1_eslint@8.48.0_vite@4.3.9/node_modules/vite-plugin-eslint/dist/index.mjs";
var __vite_injected_original_dirname = "/home/zee/Documents/code/ghcloud/prod/cube/business/visual-low-code";
var config = await defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  const projectName = "visual-low-code";
  return {
    plugins: [
      vueJsx(),
      vue(),
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
    server: {
      host: "0.0.0.0",
      origin: "//localhost:8888",
      port: 8888,
      headers: {
        "Accsee-Control-Allow-Origin": "*"
      },
      open: false,
      hmr: true
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
      origin: "http://localhost:8889",
      proxy: {
        "/api": {
          target: "https://bimops-dev-manage.guhecloud.com:30000/api",
          changeOrigin: true,
          rewrite: (path2) => path2.replace(/^\/api/, "")
        }
      }
    }
  };
});
export {
  vite_dev_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5kZXYuY29uZmlnLnRzIiwgInZpdGUuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvemVlL0RvY3VtZW50cy9jb2RlL2doY2xvdWQvcHJvZC9jdWJlL2J1c2luZXNzL3Zpc3VhbC1sb3ctY29kZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvemVlL0RvY3VtZW50cy9jb2RlL2doY2xvdWQvcHJvZC9jdWJlL2J1c2luZXNzL3Zpc3VhbC1sb3ctY29kZS92aXRlLmRldi5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvemVlL0RvY3VtZW50cy9jb2RlL2doY2xvdWQvcHJvZC9jdWJlL2J1c2luZXNzL3Zpc3VhbC1sb3ctY29kZS92aXRlLmRldi5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHsgZ2V0QmFzZUNvbmZpZyB9IGZyb20gJy4vdml0ZS5jb25maWcnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhhc3luYyAoY29uZmlnRW52KSA9PiB7XG4gIGNvbnN0IGJhc2VDb25maWcgPSBhd2FpdCBnZXRCYXNlQ29uZmlnKGNvbmZpZ0VudilcbiAgcmV0dXJuIHtcbiAgICAuLi5iYXNlQ29uZmlnLFxuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogJzAuMC4wLjAnLFxuICAgICAgcG9ydDogODg4OCxcbiAgICAgIG9yaWdpbjogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODg4OScsXG4gICAgICBwcm94eToge1xuICAgICAgICAnL2FwaSc6IHtcbiAgICAgICAgICB0YXJnZXQ6ICdodHRwczovL2JpbW9wcy1kZXYtbWFuYWdlLmd1aGVjbG91ZC5jb206MzAwMDAvYXBpJyxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS8sICcnKVxuICAgICAgICB9LFxuICAgICAgfVxuICAgIH0sXG5cbiAgfVxufSlcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvemVlL0RvY3VtZW50cy9jb2RlL2doY2xvdWQvcHJvZC9jdWJlL2J1c2luZXNzL3Zpc3VhbC1sb3ctY29kZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvemVlL0RvY3VtZW50cy9jb2RlL2doY2xvdWQvcHJvZC9jdWJlL2J1c2luZXNzL3Zpc3VhbC1sb3ctY29kZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS96ZWUvRG9jdW1lbnRzL2NvZGUvZ2hjbG91ZC9wcm9kL2N1YmUvYnVzaW5lc3MvdmlzdWFsLWxvdy1jb2RlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4J1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgdHlwZSBDb25maWdFbnYsIHR5cGUgVXNlckNvbmZpZywgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcbmltcG9ydCBxaWFua3VuIGZyb20gJ3ZpdGUtcGx1Z2luLXFpYW5rdW4nXG5pbXBvcnQgZXNsaW50UGx1Z2luIGZyb20gJ3ZpdGUtcGx1Z2luLWVzbGludCdcblxuY29uc3QgY29uZmlnID0gYXdhaXQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKVxuICBjb25zdCBwdWJsaWNQYXRoID0gZW52LlBVQkxJQ19QQVRIID8/ICcvJ1xuICBjb25zdCBwcm9qZWN0TmFtZSA9ICd2aXN1YWwtbG93LWNvZGUnXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgdnVlSnN4KCksXG4gICAgICB2dWUoKSxcbiAgICAgIGVzbGludFBsdWdpbih7XG4gICAgICAgIGluY2x1ZGU6IFsnc3JjLyoqLyoue3RzLHRzeH0nXSxcbiAgICAgIH0pLFxuICAgICAgcWlhbmt1bihwcm9qZWN0TmFtZSwge1xuICAgICAgICB1c2VEZXZNb2RlOiB0cnVlLFxuICAgICAgfSksXG4gICAgXSxcbiAgICBjc3M6IHtcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgICAgbGVzczoge1xuICAgICAgICAgIGFkZGl0aW9uYWxEYXRhOiBbXG4gICAgICAgICAgICAnQGltcG9ydCBcIkBnaGNsb3VkL2N1YmUtdGhlbWUvZHluYW1pYy1zdHlsZS9hbnRkMy12YXJsYWJsZS5sZXNzXCI7JyxcbiAgICAgICAgICBdLFxuICAgICAgICAgIG1vZGlmeVZhcnM6IHtcbiAgICAgICAgICAgICdAY3ViZS11aS1wcmVmaXgnOiBwcm9qZWN0TmFtZSxcbiAgICAgICAgICAgICdAYW50LXByZWZpeCc6IHByb2plY3ROYW1lLFxuICAgICAgICAgICAgJ0Byb290LWVudHJ5LW5hbWUnOiAndmFyaWFibGUnLFxuICAgICAgICAgICAgJ0BjdWJlLXRoZW1lLWFudGQzLXByZWZpeCc6IHByb2plY3ROYW1lLFxuICAgICAgICAgICAgJ0BjdWJlLXRoZW1lLWFudGQzLXNjb3BlLXNlbGVjdG9yJzogJyNTZWN1cmVFZHVBUFAnXG4gICAgICAgICAgfSxcbiAgICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgICBvcmlnaW46ICcvL2xvY2FsaG9zdDo4ODg4JyxcbiAgICAgIHBvcnQ6IDg4ODgsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdBY2NzZWUtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICB9LFxuICAgICAgb3BlbjogZmFsc2UsXG4gICAgICBobXI6IHRydWUsXG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGJhc2U6IHB1YmxpY1BhdGgsXG4gIH1cbn0pXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRCYXNlQ29uZmlnIChlbnY6IENvbmZpZ0Vudik6IFByb21pc2U8VXNlckNvbmZpZz4ge1xuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBjb25maWcoZW52KVxuICB9XG4gIHJldHVybiBjb25maWdcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVksU0FBUyxnQkFBQUEscUJBQW9COzs7QUNBckMsT0FBTyxZQUFZO0FBQzlZLE9BQU8sU0FBUztBQUNoQixPQUFPLFVBQVU7QUFDakIsU0FBMEMsY0FBYyxlQUFlO0FBQ3ZFLE9BQU8sYUFBYTtBQUNwQixPQUFPLGtCQUFrQjtBQUx6QixJQUFNLG1DQUFtQztBQU96QyxJQUFNLFNBQVMsTUFBTSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDOUMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBQzNDLFFBQU0sYUFBYSxJQUFJLGVBQWU7QUFDdEMsUUFBTSxjQUFjO0FBQ3BCLFNBQU87QUFBQSxJQUNMLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxNQUNQLElBQUk7QUFBQSxNQUNKLGFBQWE7QUFBQSxRQUNYLFNBQVMsQ0FBQyxtQkFBbUI7QUFBQSxNQUMvQixDQUFDO0FBQUEsTUFDRCxRQUFRLGFBQWE7QUFBQSxRQUNuQixZQUFZO0FBQUEsTUFDZCxDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsS0FBSztBQUFBLE1BQ0gscUJBQXFCO0FBQUEsUUFDbkIsTUFBTTtBQUFBLFVBQ0osZ0JBQWdCO0FBQUEsWUFDZDtBQUFBLFVBQ0Y7QUFBQSxVQUNBLFlBQVk7QUFBQSxZQUNWLG1CQUFtQjtBQUFBLFlBQ25CLGVBQWU7QUFBQSxZQUNmLG9CQUFvQjtBQUFBLFlBQ3BCLDRCQUE0QjtBQUFBLFlBQzVCLG9DQUFvQztBQUFBLFVBQ3RDO0FBQUEsVUFDQSxtQkFBbUI7QUFBQSxRQUNyQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixRQUFRO0FBQUEsTUFDUixNQUFNO0FBQUEsTUFDTixTQUFTO0FBQUEsUUFDUCwrQkFBK0I7QUFBQSxNQUNqQztBQUFBLE1BQ0EsTUFBTTtBQUFBLE1BQ04sS0FBSztBQUFBLElBQ1A7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUN0QztBQUFBLElBQ0Y7QUFBQSxJQUNBLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQztBQUVELGVBQXNCLGNBQWUsS0FBcUM7QUFDeEUsTUFBSSxPQUFPLFdBQVcsWUFBWTtBQUNoQyxXQUFPLE9BQU8sR0FBRztBQUFBLEVBQ25CO0FBQ0EsU0FBTztBQUNUOzs7QUQ1REEsSUFBTywwQkFBUUMsY0FBYSxPQUFPLGNBQWM7QUFDL0MsUUFBTSxhQUFhLE1BQU0sY0FBYyxTQUFTO0FBQ2hELFNBQU87QUFBQSxJQUNMLEdBQUc7QUFBQSxJQUNILFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLFFBQVE7QUFBQSxNQUNSLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFNBQVMsQ0FBQ0MsVUFBU0EsTUFBSyxRQUFRLFVBQVUsRUFBRTtBQUFBLFFBQzlDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUVGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsiZGVmaW5lQ29uZmlnIiwgImRlZmluZUNvbmZpZyIsICJwYXRoIl0KfQo=
