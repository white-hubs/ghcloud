// vite.dev.config.ts
import { defineConfig as defineConfig2 } from "file:///D:/whkuan/ghcloud/node_modules/.pnpm/vite@4.3.9_@types+node@18.15.11_less@4.1.3/node_modules/vite/dist/node/index.js";

// vite.config.ts
import vueJsx from "file:///D:/whkuan/ghcloud/node_modules/.pnpm/@vitejs+plugin-vue-jsx@3.0.1_vite@4.3.9_vue@3.3.4/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import path from "path";
import { defineConfig, loadEnv } from "file:///D:/whkuan/ghcloud/node_modules/.pnpm/vite@4.3.9_@types+node@18.15.11_less@4.1.3/node_modules/vite/dist/node/index.js";
import qiankun from "file:///D:/whkuan/ghcloud/node_modules/.pnpm/vite-plugin-qiankun@1.0.15_typescript@5.1.3_vite@4.3.9/node_modules/vite-plugin-qiankun/dist/index.js";
import { presetAttributify, presetIcons, presetUno } from "file:///D:/whkuan/ghcloud/node_modules/.pnpm/unocss@0.51.6_postcss@8.4.24_vite@4.3.9/node_modules/unocss/dist/index.mjs";
import Unocss from "file:///D:/whkuan/ghcloud/node_modules/.pnpm/unocss@0.51.6_postcss@8.4.24_vite@4.3.9/node_modules/unocss/dist/vite.mjs";
var __vite_injected_original_dirname = "D:\\whkuan\\ghcloud\\prod\\cube\\business\\secure-edu";
var config = await defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  const projectName = "secure-edu";
  return {
    plugins: [
      vueJsx(),
      Unocss({
        presets: [
          presetUno(),
          presetAttributify(),
          presetIcons()
        ]
      }),
      qiankun(projectName, {
        useDevMode: true
      })
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: [
            '@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";'
            // '@import "@ghcloud/cube-ui/lib/style.css";',
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
      port: 8888
    }
  };
});
export {
  vite_dev_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5kZXYuY29uZmlnLnRzIiwgInZpdGUuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcd2hrdWFuXFxcXGdoY2xvdWRcXFxccHJvZFxcXFxjdWJlXFxcXGJ1c2luZXNzXFxcXHNlY3VyZS1lZHVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXHdoa3VhblxcXFxnaGNsb3VkXFxcXHByb2RcXFxcY3ViZVxcXFxidXNpbmVzc1xcXFxzZWN1cmUtZWR1XFxcXHZpdGUuZGV2LmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovd2hrdWFuL2doY2xvdWQvcHJvZC9jdWJlL2J1c2luZXNzL3NlY3VyZS1lZHUvdml0ZS5kZXYuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHsgZ2V0QmFzZUNvbmZpZyB9IGZyb20gJy4vdml0ZS5jb25maWcnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoYXN5bmMgKGNvbmZpZ0VudikgPT4ge1xyXG4gIGNvbnN0IGJhc2VDb25maWcgPSBhd2FpdCBnZXRCYXNlQ29uZmlnKGNvbmZpZ0VudilcclxuICByZXR1cm4ge1xyXG4gICAgLi4uYmFzZUNvbmZpZyxcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICBob3N0OiAnMC4wLjAuMCcsXHJcbiAgICAgIHBvcnQ6IDg4ODhcclxuICAgIH0sXHJcbiAgfVxyXG59KVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXHdoa3VhblxcXFxnaGNsb3VkXFxcXHByb2RcXFxcY3ViZVxcXFxidXNpbmVzc1xcXFxzZWN1cmUtZWR1XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFx3aGt1YW5cXFxcZ2hjbG91ZFxcXFxwcm9kXFxcXGN1YmVcXFxcYnVzaW5lc3NcXFxcc2VjdXJlLWVkdVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovd2hrdWFuL2doY2xvdWQvcHJvZC9jdWJlL2J1c2luZXNzL3NlY3VyZS1lZHUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgdnVlSnN4IGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZS1qc3gnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbmltcG9ydCB7IHR5cGUgQ29uZmlnRW52LCB0eXBlIFVzZXJDb25maWcsIGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCBxaWFua3VuIGZyb20gJ3ZpdGUtcGx1Z2luLXFpYW5rdW4nXHJcbmltcG9ydCB7IHByZXNldEF0dHJpYnV0aWZ5LCBwcmVzZXRJY29ucywgcHJlc2V0VW5vIH0gZnJvbSAndW5vY3NzJ1xyXG5pbXBvcnQgVW5vY3NzIGZyb20gJ3Vub2Nzcy92aXRlJ1xyXG5jb25zdCBjb25maWcgPSBhd2FpdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJylcclxuICBjb25zdCBwdWJsaWNQYXRoID0gZW52LlBVQkxJQ19QQVRIID8/ICcvJ1xyXG4gIGNvbnN0IHByb2plY3ROYW1lID0gJ3NlY3VyZS1lZHUnXHJcbiAgcmV0dXJuIHtcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgdnVlSnN4KCksXHJcbiAgICAgIFVub2Nzcyh7XHJcbiAgICAgICAgcHJlc2V0czogW1xyXG4gICAgICAgICAgcHJlc2V0VW5vKCksXHJcbiAgICAgICAgICBwcmVzZXRBdHRyaWJ1dGlmeSgpLFxyXG4gICAgICAgICAgcHJlc2V0SWNvbnMoKVxyXG4gICAgICAgIF1cclxuICAgICAgfSksXHJcbiAgICAgIHFpYW5rdW4ocHJvamVjdE5hbWUsIHtcclxuICAgICAgICB1c2VEZXZNb2RlOiB0cnVlLFxyXG4gICAgICB9KSxcclxuICAgIF0sXHJcbiAgICBjc3M6IHtcclxuICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xyXG4gICAgICAgIGxlc3M6IHtcclxuICAgICAgICAgIGFkZGl0aW9uYWxEYXRhOiBbXHJcbiAgICAgICAgICAgICdAaW1wb3J0IFwiQGdoY2xvdWQvY3ViZS10aGVtZS9keW5hbWljLXN0eWxlL2FudGQzLXZhcmxhYmxlLmxlc3NcIjsnLFxyXG4gICAgICAgICAgICAvLyAnQGltcG9ydCBcIkBnaGNsb3VkL2N1YmUtdWkvbGliL3N0eWxlLmNzc1wiOycsXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgbW9kaWZ5VmFyczoge1xyXG4gICAgICAgICAgICAnQGN1YmUtdWktcHJlZml4JzogcHJvamVjdE5hbWUsXHJcbiAgICAgICAgICAgICdAYW50LXByZWZpeCc6IHByb2plY3ROYW1lLFxyXG4gICAgICAgICAgICAnQHJvb3QtZW50cnktbmFtZSc6ICd2YXJpYWJsZScsXHJcbiAgICAgICAgICAgICdAY3ViZS10aGVtZS1hbnRkMy1wcmVmaXgnOiBwcm9qZWN0TmFtZSxcclxuICAgICAgICAgICAgJ0BjdWJlLXRoZW1lLWFudGQzLXNjb3BlLXNlbGVjdG9yJzogJyNTZWN1cmVFZHVBUFAnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgamF2YXNjcmlwdEVuYWJsZWQ6IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBhbGlhczoge1xyXG4gICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgYmFzZTogcHVibGljUGF0aCxcclxuICB9XHJcbn0pXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QmFzZUNvbmZpZyAoZW52OiBDb25maWdFbnYpOiBQcm9taXNlPFVzZXJDb25maWc+IHtcclxuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgcmV0dXJuIGNvbmZpZyhlbnYpXHJcbiAgfVxyXG4gIHJldHVybiBjb25maWdcclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXFWLFNBQVMsZ0JBQUFBLHFCQUFvQjs7O0FDQXJDLE9BQU8sWUFBWTtBQUNoVyxPQUFPLFVBQVU7QUFDakIsU0FBMEMsY0FBYyxlQUFlO0FBQ3ZFLE9BQU8sYUFBYTtBQUNwQixTQUFTLG1CQUFtQixhQUFhLGlCQUFpQjtBQUMxRCxPQUFPLFlBQVk7QUFMbkIsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTSxTQUFTLE1BQU0sYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQzlDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUMzQyxRQUFNLGFBQWEsSUFBSSxlQUFlO0FBQ3RDLFFBQU0sY0FBYztBQUNwQixTQUFPO0FBQUEsSUFDTCxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxTQUFTO0FBQUEsVUFDUCxVQUFVO0FBQUEsVUFDVixrQkFBa0I7QUFBQSxVQUNsQixZQUFZO0FBQUEsUUFDZDtBQUFBLE1BQ0YsQ0FBQztBQUFBLE1BQ0QsUUFBUSxhQUFhO0FBQUEsUUFDbkIsWUFBWTtBQUFBLE1BQ2QsQ0FBQztBQUFBLElBQ0g7QUFBQSxJQUNBLEtBQUs7QUFBQSxNQUNILHFCQUFxQjtBQUFBLFFBQ25CLE1BQU07QUFBQSxVQUNKLGdCQUFnQjtBQUFBLFlBQ2Q7QUFBQTtBQUFBLFVBRUY7QUFBQSxVQUNBLFlBQVk7QUFBQSxZQUNWLG1CQUFtQjtBQUFBLFlBQ25CLGVBQWU7QUFBQSxZQUNmLG9CQUFvQjtBQUFBLFlBQ3BCLDRCQUE0QjtBQUFBLFlBQzVCLG9DQUFvQztBQUFBLFVBQ3RDO0FBQUEsVUFDQSxtQkFBbUI7QUFBQSxRQUNyQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBQUEsSUFDQSxNQUFNO0FBQUEsRUFDUjtBQUNGLENBQUM7QUFFRCxlQUFzQixjQUFlLEtBQXFDO0FBQ3hFLE1BQUksT0FBTyxXQUFXLFlBQVk7QUFDaEMsV0FBTyxPQUFPLEdBQUc7QUFBQSxFQUNuQjtBQUNBLFNBQU87QUFDVDs7O0FEckRBLElBQU8sMEJBQVFDLGNBQWEsT0FBTyxjQUFjO0FBQy9DLFFBQU0sYUFBYSxNQUFNLGNBQWMsU0FBUztBQUNoRCxTQUFPO0FBQUEsSUFDTCxHQUFHO0FBQUEsSUFDSCxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJkZWZpbmVDb25maWciLCAiZGVmaW5lQ29uZmlnIl0KfQo=
