// vite.dev.config.ts
import { defineConfig as defineConfig2 } from "file:///Users/bi/code/ghcloud/node_modules/.pnpm/vite@4.4.3_@types+node@18.16.19_less@4.1.3_terser@5.19.0/node_modules/vite/dist/node/index.js";

// vite.config.ts
import vueJsx from "file:///Users/bi/code/ghcloud/node_modules/.pnpm/@vitejs+plugin-vue-jsx@3.0.1_vite@4.4.3_vue@3.3.4/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import path from "path";
import { defineConfig, loadEnv } from "file:///Users/bi/code/ghcloud/node_modules/.pnpm/vite@4.4.3_@types+node@18.16.19_less@4.1.3_terser@5.19.0/node_modules/vite/dist/node/index.js";
import qiankun from "file:///Users/bi/code/ghcloud/node_modules/.pnpm/vite-plugin-qiankun@1.0.15_typescript@5.1.6_vite@4.4.3/node_modules/vite-plugin-qiankun/dist/index.js";
import pugPlugin from "file:///Users/bi/code/ghcloud/node_modules/.pnpm/vue-pug-plugin@2.0.3_pug@3.0.2/node_modules/vue-pug-plugin/index.js";
import vuePlugin from "file:///Users/bi/code/ghcloud/node_modules/.pnpm/@vitejs+plugin-vue@4.2.3_vite@4.4.3_vue@3.3.4/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vitePluginCommonJS from "file:///Users/bi/code/ghcloud/node_modules/.pnpm/vite-plugin-commonjs@0.6.2/node_modules/vite-plugin-commonjs/index.js";
var __vite_injected_original_dirname = "/Users/bi/code/ghcloud/legacy/business-config-migrate";
var config = await defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  const projectName = "legacy-business-config";
  return {
    plugins: [
      vitePluginCommonJS(),
      vuePlugin({
        template: {
          preprocessOptions: {
            plugins: [
              pugPlugin
            ]
          }
        }
      }),
      vueJsx(),
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
            "@ant-prefix": projectName,
            "@root-entry-name": "variable",
            "@cube-theme-antd3-prefix": projectName,
            "@cube-theme-antd3-scope-selector": "#LegacyBusinessConfigApp"
          },
          javascriptEnabled: true
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src"),
        "~basscss": path.resolve(__vite_injected_original_dirname, "./node_modules/basscss")
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
      origin: "http://localhost:8888",
      proxy: {
        "/resource": {
          target: "http://192.168.0.221:9090",
          rewrite: (path2) => path2.replace("/resource", "/ghcloud-web-static/")
        }
      }
    }
  };
});
export {
  vite_dev_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5kZXYuY29uZmlnLnRzIiwgInZpdGUuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2JpL2NvZGUvZ2hjbG91ZC9sZWdhY3kvYnVzaW5lc3MtY29uZmlnLW1pZ3JhdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9iaS9jb2RlL2doY2xvdWQvbGVnYWN5L2J1c2luZXNzLWNvbmZpZy1taWdyYXRlL3ZpdGUuZGV2LmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYmkvY29kZS9naGNsb3VkL2xlZ2FjeS9idXNpbmVzcy1jb25maWctbWlncmF0ZS92aXRlLmRldi5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHsgZ2V0QmFzZUNvbmZpZyB9IGZyb20gJy4vdml0ZS5jb25maWcnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhhc3luYyAoY29uZmlnRW52KSA9PiB7XG4gIGNvbnN0IGJhc2VDb25maWcgPSBhd2FpdCBnZXRCYXNlQ29uZmlnKGNvbmZpZ0VudilcbiAgcmV0dXJuIHtcbiAgICAuLi5iYXNlQ29uZmlnLFxuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogJzAuMC4wLjAnLFxuICAgICAgcG9ydDogODg4OCxcbiAgICAgIG9yaWdpbjogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODg4OCcsXG4gICAgICBwcm94eToge1xuICAgICAgICAnL3Jlc291cmNlJzoge1xuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly8xOTIuMTY4LjAuMjIxOjkwOTAnLFxuICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoJy9yZXNvdXJjZScsICcvZ2hjbG91ZC13ZWItc3RhdGljLycpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICB9XG59KVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYmkvY29kZS9naGNsb3VkL2xlZ2FjeS9idXNpbmVzcy1jb25maWctbWlncmF0ZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2JpL2NvZGUvZ2hjbG91ZC9sZWdhY3kvYnVzaW5lc3MtY29uZmlnLW1pZ3JhdGUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2JpL2NvZGUvZ2hjbG91ZC9sZWdhY3kvYnVzaW5lc3MtY29uZmlnLW1pZ3JhdGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgdnVlSnN4IGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZS1qc3gnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgdHlwZSBDb25maWdFbnYsIHR5cGUgVXNlckNvbmZpZywgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcbmltcG9ydCBxaWFua3VuIGZyb20gJ3ZpdGUtcGx1Z2luLXFpYW5rdW4nXG5pbXBvcnQgcHVnUGx1Z2luIGZyb20gJ3Z1ZS1wdWctcGx1Z2luJ1xuaW1wb3J0IHZ1ZVBsdWdpbiBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgdml0ZVBsdWdpbkNvbW1vbkpTIGZyb20gJ3ZpdGUtcGx1Z2luLWNvbW1vbmpzJ1xuXG5jb25zdCBjb25maWcgPSBhd2FpdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpXG4gIGNvbnN0IHB1YmxpY1BhdGggPSBlbnYuUFVCTElDX1BBVEggPz8gJy8nXG4gIGNvbnN0IHByb2plY3ROYW1lID0gJ2xlZ2FjeS1idXNpbmVzcy1jb25maWcnXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgdml0ZVBsdWdpbkNvbW1vbkpTKCksXG4gICAgICB2dWVQbHVnaW4oe1xuICAgICAgICB0ZW1wbGF0ZToge1xuICAgICAgICAgIHByZXByb2Nlc3NPcHRpb25zOiB7XG4gICAgICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAgICAgIHB1Z1BsdWdpblxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICB2dWVKc3goKSxcbiAgICAgIHFpYW5rdW4ocHJvamVjdE5hbWUsIHtcbiAgICAgICAgdXNlRGV2TW9kZTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgIF0sXG4gICAgY3NzOiB7XG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICAgIGxlc3M6IHtcbiAgICAgICAgICBhZGRpdGlvbmFsRGF0YTogW1xuICAgICAgICAgICAgJ0BpbXBvcnQgXCJAZ2hjbG91ZC9jdWJlLXRoZW1lL2R5bmFtaWMtc3R5bGUvYW50ZDMtdmFybGFibGUubGVzc1wiOycsXG4gICAgICAgICAgXSxcbiAgICAgICAgICBtb2RpZnlWYXJzOiB7XG4gICAgICAgICAgICAnQGFudC1wcmVmaXgnOiBwcm9qZWN0TmFtZSxcbiAgICAgICAgICAgICdAcm9vdC1lbnRyeS1uYW1lJzogJ3ZhcmlhYmxlJyxcbiAgICAgICAgICAgICdAY3ViZS10aGVtZS1hbnRkMy1wcmVmaXgnOiBwcm9qZWN0TmFtZSxcbiAgICAgICAgICAgICdAY3ViZS10aGVtZS1hbnRkMy1zY29wZS1zZWxlY3Rvcic6ICcjTGVnYWN5QnVzaW5lc3NDb25maWdBcHAnXG4gICAgICAgICAgfSxcbiAgICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICAgICAgXCJ+YmFzc2Nzc1wiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vbm9kZV9tb2R1bGVzL2Jhc3Njc3NcIiksXG4gICAgICB9LFxuICAgIH0sXG4gICAgYmFzZTogcHVibGljUGF0aCxcbiAgfVxufSlcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEJhc2VDb25maWcgKGVudjogQ29uZmlnRW52KTogUHJvbWlzZTxVc2VyQ29uZmlnPiB7XG4gIGlmICh0eXBlb2YgY29uZmlnID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGNvbmZpZyhlbnYpXG4gIH1cbiAgcmV0dXJuIGNvbmZpZ1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5VixTQUFTLGdCQUFBQSxxQkFBb0I7OztBQ0FyQyxPQUFPLFlBQVk7QUFDcFcsT0FBTyxVQUFVO0FBQ2pCLFNBQTBDLGNBQWMsZUFBZTtBQUN2RSxPQUFPLGFBQWE7QUFDcEIsT0FBTyxlQUFlO0FBQ3RCLE9BQU8sZUFBZTtBQUN0QixPQUFPLHdCQUF3QjtBQU4vQixJQUFNLG1DQUFtQztBQVF6QyxJQUFNLFNBQVMsTUFBTSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDOUMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBQzNDLFFBQU0sYUFBYSxJQUFJLGVBQWU7QUFDdEMsUUFBTSxjQUFjO0FBQ3BCLFNBQU87QUFBQSxJQUNMLFNBQVM7QUFBQSxNQUNQLG1CQUFtQjtBQUFBLE1BQ25CLFVBQVU7QUFBQSxRQUNSLFVBQVU7QUFBQSxVQUNSLG1CQUFtQjtBQUFBLFlBQ2pCLFNBQVM7QUFBQSxjQUNQO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRixDQUFDO0FBQUEsTUFDRCxPQUFPO0FBQUEsTUFDUCxRQUFRLGFBQWE7QUFBQSxRQUNuQixZQUFZO0FBQUEsTUFDZCxDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsS0FBSztBQUFBLE1BQ0gscUJBQXFCO0FBQUEsUUFDbkIsTUFBTTtBQUFBLFVBQ0osZ0JBQWdCO0FBQUEsWUFDZDtBQUFBLFVBQ0Y7QUFBQSxVQUNBLFlBQVk7QUFBQSxZQUNWLGVBQWU7QUFBQSxZQUNmLG9CQUFvQjtBQUFBLFlBQ3BCLDRCQUE0QjtBQUFBLFlBQzVCLG9DQUFvQztBQUFBLFVBQ3RDO0FBQUEsVUFDQSxtQkFBbUI7QUFBQSxRQUNyQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsUUFDcEMsWUFBWSxLQUFLLFFBQVEsa0NBQVcsd0JBQXdCO0FBQUEsTUFDOUQ7QUFBQSxJQUNGO0FBQUEsSUFDQSxNQUFNO0FBQUEsRUFDUjtBQUNGLENBQUM7QUFFRCxlQUFzQixjQUFlLEtBQXFDO0FBQ3hFLE1BQUksT0FBTyxXQUFXLFlBQVk7QUFDaEMsV0FBTyxPQUFPLEdBQUc7QUFBQSxFQUNuQjtBQUNBLFNBQU87QUFDVDs7O0FEekRBLElBQU8sMEJBQVFDLGNBQWEsT0FBTyxjQUFjO0FBQy9DLFFBQU0sYUFBYSxNQUFNLGNBQWMsU0FBUztBQUNoRCxTQUFPO0FBQUEsSUFDTCxHQUFHO0FBQUEsSUFDSCxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixRQUFRO0FBQUEsTUFDUixPQUFPO0FBQUEsUUFDTCxhQUFhO0FBQUEsVUFDWCxRQUFRO0FBQUEsVUFDUixTQUFTLENBQUNDLFVBQVNBLE1BQUssUUFBUSxhQUFhLHNCQUFzQjtBQUFBLFFBQ3JFO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsiZGVmaW5lQ29uZmlnIiwgImRlZmluZUNvbmZpZyIsICJwYXRoIl0KfQo=
