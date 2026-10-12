// vite.build.config.ts
import { defineConfig as defineConfig2 } from "file:///Users/quan/ghcloud/node_modules/.pnpm/vite@4.5.1_@types+node@22.13.10_less@4.2.0_sass@1.92.1_stylus@0.62.0_terser@5.44.0/node_modules/vite/dist/node/index.js";

// vite.config.ts
import vueJsx from "file:///Users/quan/ghcloud/node_modules/.pnpm/@vitejs+plugin-vue-jsx@3.1.0_vite@4.5.1_@types+node@22.13.10_less@4.2.0_sass@1.92.1_sty_88657291953e53955a9eac24ac9d9ef1/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import path from "path";
import { defineConfig, loadEnv } from "file:///Users/quan/ghcloud/node_modules/.pnpm/vite@4.5.1_@types+node@22.13.10_less@4.2.0_sass@1.92.1_stylus@0.62.0_terser@5.44.0/node_modules/vite/dist/node/index.js";
import qiankun from "file:///Users/quan/ghcloud/node_modules/.pnpm/vite-plugin-qiankun@1.0.15_typescript@5.8.2_vite@4.5.1_@types+node@22.13.10_less@4.2.0__a0887f9e4d1a348db383b72c4f0d4150/node_modules/vite-plugin-qiankun/dist/index.js";
import { presetAttributify, presetIcons, presetUno } from "file:///Users/quan/ghcloud/node_modules/.pnpm/unocss@0.51.13_postcss@8.5.6_rollup@4.50.1_vite@4.5.1_@types+node@22.13.10_less@4.2.0_s_9de02949c573df0744f316d9fad705b5/node_modules/unocss/dist/index.mjs";
import Unocss from "file:///Users/quan/ghcloud/node_modules/.pnpm/unocss@0.51.13_postcss@8.5.6_rollup@4.50.1_vite@4.5.1_@types+node@22.13.10_less@4.2.0_s_9de02949c573df0744f316d9fad705b5/node_modules/unocss/dist/vite.mjs";
import { createHtmlPlugin } from "file:///Users/quan/ghcloud/node_modules/.pnpm/vite-plugin-html@3.2.2_vite@4.5.1_@types+node@22.13.10_less@4.2.0_sass@1.92.1_stylus@0.62.0_terser@5.44.0_/node_modules/vite-plugin-html/dist/index.mjs";

// package.json
var version = "1.3.6";

// vite.config.ts
import "file:///Users/quan/ghcloud/node_modules/.pnpm/vite-plugin-eslint@1.8.1_eslint@9.22.0_jiti@2.5.1__vite@4.5.1_@types+node@22.13.10_less_d19365216ab8e2baa0d2f1f7b42e1d94/node_modules/vite-plugin-eslint/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/quan/ghcloud/prod/cube/apps/secure-edu/app";
var config = await defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  const projectName = "secure-edu";
  return {
    plugins: [
      vueJsx(),
      // eslintPlugin({
      //   include: ['src/**/*.{ts,tsx}'],
      // }),
      Unocss({
        presets: [
          presetUno(),
          presetAttributify(),
          presetIcons()
        ]
      }),
      createHtmlPlugin({
        inject: {
          data: {
            version
          }
        }
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
    base: publicPath,
    define: {
      __ENV__: {
        isHeadMode: env.HEAD ?? false
      }
    }
  };
});
async function getBaseConfig(env) {
  if (typeof config === "function") {
    return config(env);
  }
  return config;
}

// vite.build.config.ts
var vite_build_config_default = defineConfig2(async (configEnv) => {
  const baseConfig = await getBaseConfig(configEnv);
  return {
    ...baseConfig,
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: "assets/[hash].js",
          assetFileNames: "assets/[hash].[ext]",
          entryFileNames: "assets/[hash].js"
        }
      }
    }
  };
});
export {
  vite_build_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5idWlsZC5jb25maWcudHMiLCAidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3F1YW4vZ2hjbG91ZC9wcm9kL2N1YmUvYXBwcy9zZWN1cmUtZWR1L2FwcFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3F1YW4vZ2hjbG91ZC9wcm9kL2N1YmUvYXBwcy9zZWN1cmUtZWR1L2FwcC92aXRlLmJ1aWxkLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvcXVhbi9naGNsb3VkL3Byb2QvY3ViZS9hcHBzL3NlY3VyZS1lZHUvYXBwL3ZpdGUuYnVpbGQuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IGdldEJhc2VDb25maWcgfSBmcm9tICcuL3ZpdGUuY29uZmlnJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoYXN5bmMgKGNvbmZpZ0VudikgPT4ge1xuICBjb25zdCBiYXNlQ29uZmlnID0gYXdhaXQgZ2V0QmFzZUNvbmZpZyhjb25maWdFbnYpXG4gIHJldHVybiB7XG4gICAgLi4uYmFzZUNvbmZpZyxcbiAgICBidWlsZDoge1xuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9baGFzaF0uanMnLFxuICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnYXNzZXRzL1toYXNoXS5bZXh0XScsXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdhc3NldHMvW2hhc2hdLmpzJyxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gIH1cbn0pXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9xdWFuL2doY2xvdWQvcHJvZC9jdWJlL2FwcHMvc2VjdXJlLWVkdS9hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9xdWFuL2doY2xvdWQvcHJvZC9jdWJlL2FwcHMvc2VjdXJlLWVkdS9hcHAvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3F1YW4vZ2hjbG91ZC9wcm9kL2N1YmUvYXBwcy9zZWN1cmUtZWR1L2FwcC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB2dWVKc3ggZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlLWpzeCdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyB0eXBlIENvbmZpZ0VudiwgdHlwZSBVc2VyQ29uZmlnLCBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHFpYW5rdW4gZnJvbSAndml0ZS1wbHVnaW4tcWlhbmt1bidcbmltcG9ydCB7IHByZXNldEF0dHJpYnV0aWZ5LCBwcmVzZXRJY29ucywgcHJlc2V0VW5vIH0gZnJvbSAndW5vY3NzJ1xuaW1wb3J0IFVub2NzcyBmcm9tICd1bm9jc3Mvdml0ZSdcbmltcG9ydCB7IGNyZWF0ZUh0bWxQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1odG1sJ1xuaW1wb3J0IHsgdmVyc2lvbiB9IGZyb20gJy4vcGFja2FnZS5qc29uJ1xuaW1wb3J0IGVzbGludFBsdWdpbiBmcm9tICd2aXRlLXBsdWdpbi1lc2xpbnQnXG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYXdhaXQtdGhlbmFibGVcbmNvbnN0IGNvbmZpZyA9IGF3YWl0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJylcbiAgY29uc3QgcHVibGljUGF0aCA9IGVudi5QVUJMSUNfUEFUSCA/PyAnLydcbiAgY29uc3QgcHJvamVjdE5hbWUgPSAnc2VjdXJlLWVkdSdcblxuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtcbiAgICAgIHZ1ZUpzeCgpLFxuICAgICAgLy8gZXNsaW50UGx1Z2luKHtcbiAgICAgIC8vICAgaW5jbHVkZTogWydzcmMvKiovKi57dHMsdHN4fSddLFxuICAgICAgLy8gfSksXG4gICAgICBVbm9jc3Moe1xuICAgICAgICBwcmVzZXRzOiBbXG4gICAgICAgICAgcHJlc2V0VW5vKCksXG4gICAgICAgICAgcHJlc2V0QXR0cmlidXRpZnkoKSxcbiAgICAgICAgICBwcmVzZXRJY29ucygpXG4gICAgICAgIF1cbiAgICAgIH0pLFxuICAgICAgY3JlYXRlSHRtbFBsdWdpbih7XG4gICAgICAgIGluamVjdDoge1xuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHZlcnNpb25cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgcWlhbmt1bihwcm9qZWN0TmFtZSwge1xuICAgICAgICB1c2VEZXZNb2RlOiB0cnVlLFxuICAgICAgfSksXG4gICAgXSxcbiAgICBjc3M6IHtcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgICAgbGVzczoge1xuICAgICAgICAgIGFkZGl0aW9uYWxEYXRhOiBbXG4gICAgICAgICAgICAnQGltcG9ydCBcIkBnaGNsb3VkL2N1YmUtdGhlbWUvZHluYW1pYy1zdHlsZS9hbnRkMy12YXJsYWJsZS5sZXNzXCI7JyxcbiAgICAgICAgICBdLFxuICAgICAgICAgIG1vZGlmeVZhcnM6IHtcbiAgICAgICAgICAgICdAY3ViZS11aS1wcmVmaXgnOiBwcm9qZWN0TmFtZSxcbiAgICAgICAgICAgICdAYW50LXByZWZpeCc6IHByb2plY3ROYW1lLFxuICAgICAgICAgICAgJ0Byb290LWVudHJ5LW5hbWUnOiAndmFyaWFibGUnLFxuICAgICAgICAgICAgJ0BjdWJlLXRoZW1lLWFudGQzLXByZWZpeCc6IHByb2plY3ROYW1lLFxuICAgICAgICAgICAgJ0BjdWJlLXRoZW1lLWFudGQzLXNjb3BlLXNlbGVjdG9yJzogJyNTZWN1cmVFZHVBUFAnXG4gICAgICAgICAgfSxcbiAgICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBiYXNlOiBwdWJsaWNQYXRoLFxuICAgIGRlZmluZToge1xuICAgICAgX19FTlZfXzoge1xuICAgICAgICBpc0hlYWRNb2RlOiBlbnYuSEVBRCA/PyBmYWxzZSxcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRCYXNlQ29uZmlnIChlbnY6IENvbmZpZ0Vudik6IFByb21pc2U8VXNlckNvbmZpZz4ge1xuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBjb25maWcoZW52KVxuICB9XG4gIHJldHVybiBjb25maWdcbn1cbiIsICJ7XG4gIFwibmFtZVwiOiBcIkBnaGNsb3VkL2N1YmUtc2VjdXJlLWVkdS1hcHBcIixcbiAgXCJwcml2YXRlXCI6IGZhbHNlLFxuICBcInZlcnNpb25cIjogXCIxLjMuNlwiLFxuICBcInR5cGVcIjogXCJtb2R1bGVcIixcbiAgXCJwdWJsaXNoQ29uZmlnXCI6IHtcbiAgICBcInJlZ2lzdHJ5XCI6IFwiaHR0cDovL25leHVzLmd1aGVjbG91ZC5jb206ODg4OC9yZXBvc2l0b3J5L25wbS1ob3N0ZWQvXCJcbiAgfSxcbiAgXCJmaWxlc1wiOiBbXG4gICAgXCJkaXN0L1wiXG4gIF0sXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJkZXZcIjogXCJ2aXRlIC1jIHZpdGUuZGV2LmNvbmZpZy50cyAtLW1vZGUgZGV2XCIsXG4gICAgXCJoZWFkXCI6IFwidml0ZSAtYyB2aXRlLmRldi5jb25maWcudHMgLS1tb2RlIGhlYWRcIixcbiAgICBcImJ1aWxkXCI6IFwidml0ZSBidWlsZCAtYyB2aXRlLmJ1aWxkLmNvbmZpZy50cyBcIixcbiAgICBcImJ1aWxkOmRldlwiOiBcInZpdGUgYnVpbGQgLWMgdml0ZS5idWlsZC5jb25maWcudHMgLS1tb2RlIGRldlwiLFxuICAgIFwiYnVpbGQ6dGVzdFwiOiBcInZpdGUgYnVpbGQgLWMgdml0ZS5idWlsZC5jb25maWcudHMgLS1tb2RlIHRlc3RcIixcbiAgICBcImJ1aWxkOnByb2RcIjogXCJ2aXRlIGJ1aWxkIC1jIHZpdGUuYnVpbGQuY29uZmlnLnRzIC0tbW9kZSBwcm9kXCIsXG4gICAgXCJidWlsZDpoZWFkXCI6IFwidml0ZSBidWlsZCAtYyB2aXRlLmJ1aWxkLmNvbmZpZy50cyAtLW1vZGUgaGVhZFwiLFxuICAgIFwicHJldmlld1wiOiBcInZpdGUgcHJldmlldyAtYyB2aXRlLnByZXZpZXcuY29uZmlnLnRzXCIsXG4gICAgXCJsaW50XCI6IFwiZXNsaW50IC4gLS1pZ25vcmUtcGF0aCAuZ2l0aWdub3JlIC0tZml4XCJcbiAgfSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGdoY2xvdWQvY3ViZS10aGVtZVwiOiBcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJAZ2hjbG91ZC9jdWJlLXVpXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcIkBnaGNsb3VkL2R5bmFtaWMtZm9ybS1yZW5kZXJcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwiQGdoY2xvdWQvZ2VuZXJpYy1jb21wb25lbnRcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwiQGdoY2xvdWQvZ2hjbG91ZC1idXNpbmVzcy1yZXF1ZXN0XCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcIkBnaGNsb3VkL2N1YmUtbWVzc2FnZS1jZW50ZXItc2VydmljZVwiOiBcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJAZ2hjbG91ZC9sb2dnZXJcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwiQGdoY2xvdWQvY3ViZS1kYXRhLWludGVncmF0ZS1zZXJ2aWNlXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcIkBnaGNsb3VkL2N1YmUtc2VjdXJlLWVkdS1zZXJ2aWNlXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcIkBnaGNsb3VkL2N1YmUtZmlsZS1zZXJ2aWNlXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcIkB0eXBlcy9xcmNvZGVcIjogXCJeMS41LjBcIixcbiAgICBcImF4aW9zXCI6IFwiXjEuMy42XCIsXG4gICAgXCJkYXlqc1wiOiBcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJlY2hhcnRzXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcInFyY29kZVwiOiBcIl4xLjUuM1wiLFxuICAgIFwic29ydGFibGVqc1wiOiBcIl4xLjE1LjBcIixcbiAgICBcInZ1ZVwiOiBcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJ2dWUtcm91dGVyXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcInZ1ZS1jbGlwYm9hcmQzXCI6IFwiMi4wLjBcIlxuICB9LFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAZ2hjbG91ZC9lc2xpbnQtY29uZmlnLXN0YW5kYXJkLXZ1ZTMtdHN4XCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcIkB0eXBlcy9ub2RlXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcIkB0eXBlcy9zb3J0YWJsZWpzXCI6IFwiXjEuMTUuMVwiLFxuICAgIFwiQHVub2Nzcy9wcmVzZXQtYXR0cmlidXRpZnlcIjogXCJeMC41MS42XCIsXG4gICAgXCJAdW5vY3NzL3ByZXNldC1pY29uc1wiOiBcIl4wLjUxLjZcIixcbiAgICBcIkB1bm9jc3MvcHJlc2V0LXVub1wiOiBcIl4wLjUxLjZcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXZ1ZS1qc3hcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwiZXNsaW50XCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcImxlc3NcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwidHlwZXNjcmlwdFwiOiBcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJ0eXBlc2NyaXB0LXBsdWdpbi1jc3MtbW9kdWxlc1wiOiBcIl41LjAuMVwiLFxuICAgIFwidW5vY3NzXCI6IFwiXjAuNTEuNlwiLFxuICAgIFwidml0ZVwiOiBcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJ2aXRlLXBsdWdpbi1lc2xpbnRcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwidml0ZS1wbHVnaW4tcWlhbmt1blwiOiBcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJ2dWUtdHNjXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcInZpdGUtcGx1Z2luLWh0bWxcIjogXCJ3b3Jrc3BhY2U6XlwiXG4gIH1cbn0iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlWLFNBQVMsZ0JBQUFBLHFCQUFvQjs7O0FDQXpDLE9BQU8sWUFBWTtBQUN4VixPQUFPLFVBQVU7QUFDakIsU0FBMEMsY0FBYyxlQUFlO0FBQ3ZFLE9BQU8sYUFBYTtBQUNwQixTQUFTLG1CQUFtQixhQUFhLGlCQUFpQjtBQUMxRCxPQUFPLFlBQVk7QUFDbkIsU0FBUyx3QkFBd0I7OztBQ0gvQixjQUFXOzs7QURLYixPQUF5QjtBQVJ6QixJQUFNLG1DQUFtQztBQVd6QyxJQUFNLFNBQVMsTUFBTSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDOUMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBQzNDLFFBQU0sYUFBYSxJQUFJLGVBQWU7QUFDdEMsUUFBTSxjQUFjO0FBRXBCLFNBQU87QUFBQSxJQUNMLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUlQLE9BQU87QUFBQSxRQUNMLFNBQVM7QUFBQSxVQUNQLFVBQVU7QUFBQSxVQUNWLGtCQUFrQjtBQUFBLFVBQ2xCLFlBQVk7QUFBQSxRQUNkO0FBQUEsTUFDRixDQUFDO0FBQUEsTUFDRCxpQkFBaUI7QUFBQSxRQUNmLFFBQVE7QUFBQSxVQUNOLE1BQU07QUFBQSxZQUNKO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLENBQUM7QUFBQSxNQUNELFFBQVEsYUFBYTtBQUFBLFFBQ25CLFlBQVk7QUFBQSxNQUNkLENBQUM7QUFBQSxJQUNIO0FBQUEsSUFDQSxLQUFLO0FBQUEsTUFDSCxxQkFBcUI7QUFBQSxRQUNuQixNQUFNO0FBQUEsVUFDSixnQkFBZ0I7QUFBQSxZQUNkO0FBQUEsVUFDRjtBQUFBLFVBQ0EsWUFBWTtBQUFBLFlBQ1YsbUJBQW1CO0FBQUEsWUFDbkIsZUFBZTtBQUFBLFlBQ2Ysb0JBQW9CO0FBQUEsWUFDcEIsNEJBQTRCO0FBQUEsWUFDNUIsb0NBQW9DO0FBQUEsVUFDdEM7QUFBQSxVQUNBLG1CQUFtQjtBQUFBLFFBQ3JCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUN0QztBQUFBLElBQ0Y7QUFBQSxJQUNBLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxNQUNOLFNBQVM7QUFBQSxRQUNQLFlBQVksSUFBSSxRQUFRO0FBQUEsTUFDMUI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7QUFFRCxlQUFzQixjQUFlLEtBQXFDO0FBQ3hFLE1BQUksT0FBTyxXQUFXLFlBQVk7QUFDaEMsV0FBTyxPQUFPLEdBQUc7QUFBQSxFQUNuQjtBQUNBLFNBQU87QUFDVDs7O0FEekVBLElBQU8sNEJBQVFDLGNBQWEsT0FBTyxjQUFjO0FBQy9DLFFBQU0sYUFBYSxNQUFNLGNBQWMsU0FBUztBQUNoRCxTQUFPO0FBQUEsSUFDTCxHQUFHO0FBQUEsSUFDSCxPQUFPO0FBQUEsTUFDTCxlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUEsVUFDTixnQkFBZ0I7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQSxRQUNsQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbImRlZmluZUNvbmZpZyIsICJkZWZpbmVDb25maWciXQp9Cg==
