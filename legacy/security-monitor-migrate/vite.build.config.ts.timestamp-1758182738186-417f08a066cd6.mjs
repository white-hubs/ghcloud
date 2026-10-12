// vite.build.config.ts
import { defineConfig as defineConfig2 } from "file:///Users/quan/ghcloud/node_modules/.pnpm/vite@4.5.1_@types+node@22.13.10_less@4.2.0_sass@1.92.1_stylus@0.62.0_terser@5.44.0/node_modules/vite/dist/node/index.js";

// vite.config.ts
import vueJsx from "file:///Users/quan/ghcloud/node_modules/.pnpm/@vitejs+plugin-vue-jsx@3.1.0_vite@4.5.1_@types+node@22.13.10_less@4.2.0_sass@1.92.1_sty_88657291953e53955a9eac24ac9d9ef1/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import path from "path";
import { defineConfig, loadEnv } from "file:///Users/quan/ghcloud/node_modules/.pnpm/vite@4.5.1_@types+node@22.13.10_less@4.2.0_sass@1.92.1_stylus@0.62.0_terser@5.44.0/node_modules/vite/dist/node/index.js";
import qiankun from "file:///Users/quan/ghcloud/node_modules/.pnpm/vite-plugin-qiankun@1.0.15_typescript@5.8.2_vite@4.5.1_@types+node@22.13.10_less@4.2.0__a0887f9e4d1a348db383b72c4f0d4150/node_modules/vite-plugin-qiankun/dist/index.js";
import pugPlugin from "file:///Users/quan/ghcloud/node_modules/.pnpm/vue-pug-plugin@2.0.3_pug@3.0.3/node_modules/vue-pug-plugin/index.js";
import vuePlugin from "file:///Users/quan/ghcloud/node_modules/.pnpm/@vitejs+plugin-vue@4.5.1_vite@4.5.1_@types+node@22.13.10_less@4.2.0_sass@1.92.1_stylus@_7117a5bdb7f269139ddbd723735e1f1f/node_modules/@vitejs/plugin-vue/dist/index.mjs";

// package.json
var package_default = {
  name: "@ghcloud-legacy/security-monitor-migrate",
  private: false,
  version: "1.5.24",
  type: "module",
  publishConfig: {
    registry: "http://nexus.guhecloud.com:8888/repository/npm-hosted/"
  },
  files: [
    "dist/"
  ],
  scripts: {
    dev: "vite -c vite.dev.config.ts",
    build: "vite build -c vite.build.config.ts",
    "build:dev": "vite build -c vite.build.config.ts --mode dev",
    "build:test": "vite build -c vite.build.config.ts --mode test",
    "build:prod": "vite build -c vite.build.config.ts --mode prod",
    "build:preview": "vite build -c vite.build.config.ts --mode preview",
    preview: "vite preview -c vite.preview.config.ts",
    lint: "eslint . --ignore-path .gitignore --fix"
  },
  dependencies: {
    "@ghcloud/cube-player": "workspace:^",
    "@ant-design/icons-vue": "workspace:^",
    "@ghcloud/cube-mdata-service": "workspace:^",
    "@ghcloud/cube-alarm-center-service": "workspace:^",
    "@ghcloud/cube-ouaa-service": "workspace:^",
    "@ghcloud/cube-alarm-charts": "workspace:^",
    "@ghcloud/cube-file-service": "workspace:^",
    "@ghcloud/cube-iot-center-service": "workspace:^",
    "@ghcloud/cube-theme": "workspace:^",
    "@ghcloud/cube-ui": "workspace:^",
    "@ghcloud/cube-mf-root": "workspace:^",
    "@ghcloud-legacy/bimops-fe-web-migrate-lib": "workspace:^",
    "@pansy/replace-object-keys": "^0.5.0",
    "@pansy/utils": "^0.5.1",
    "ant-design-vue": "2.2.8",
    "antd-theme-generator": "1.2.10",
    axios: "^0.21.1",
    basscss: "workspace:^",
    "core-js": "^3.6.5",
    echarts: "workspace:^",
    "file-saver": "^2.0.5",
    html2canvas: "^1.4.1",
    "js-base64": "^3.6.1",
    jspdf: "^2.5.1",
    jszip: "^3.7.1",
    lodash: "^4.17.21",
    "lodash-es": "^4.17.21",
    moment: "^2.29.1",
    path: "^0.12.7",
    qrcodejs2: "^0.0.2",
    qs: "^6.10.1",
    sortablejs: "^1.14.0",
    vue: "workspace:^",
    "@ghcloud/cube-utils": "workspace:^",
    "vue-amap": "^0.5.10",
    "vue-monoplasty-slide-verify": "^1.1.3",
    "vue-router": "workspace:^",
    vuedraggable: "^2.24.3",
    "vuedraggable-es": "workspace:^",
    vuex: "workspace:^",
    wangeditor: "^4.7.11"
  },
  devDependencies: {
    "@ghcloud/eslint-config-standard-vue3": "workspace:^",
    "@types/node": "workspace:^",
    "@vitejs/plugin-vue": "workspace:^",
    "@vitejs/plugin-vue-jsx": "workspace:^",
    eslint: "workspace:^",
    less: "workspace:^",
    typescript: "workspace:^",
    vite: "workspace:^",
    "vite-plugin-qiankun": "workspace:^",
    "vue-pug-plugin": "workspace:^",
    "vue-tsc": "workspace:^",
    "vite-plugin-html": "workspace:^"
  }
};

// vite.config.ts
import { createHtmlPlugin } from "file:///Users/quan/ghcloud/node_modules/.pnpm/vite-plugin-html@3.2.2_vite@4.5.1_@types+node@22.13.10_less@4.2.0_sass@1.92.1_stylus@0.62.0_terser@5.44.0_/node_modules/vite-plugin-html/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/quan/ghcloud/legacy/security-monitor-migrate";
var config = await defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  const projectName = package_default.name.replace("@ghcloud-legacy/", "");
  const containerId = `#${env.VITE_CONTAINER_ID}`;
  return {
    plugins: [
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
      createHtmlPlugin({
        inject: {
          data: {
            version: package_default.version
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
            '@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";@import "@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/base.less";'
          ],
          modifyVars: {
            "@ant-prefix": projectName,
            "@root-entry-name": "variable",
            "@cube-theme-antd3-prefix": projectName,
            "@cube-theme-antd3-scope-selector": containerId
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
    base: publicPath,
    define: {
      /**
       * > String 值会以原始表达式形式使用，所以如果定义了一个字符串常量，它需要被显式地打引号。（例如使用 `JSON.stringify`）
       * 
       * [参考](https://cn.vitejs.dev/config/shared-options.html#define)
       */
      __CONTAINER_ID__: JSON.stringify(containerId),
      __PUBLIC_PATH__: JSON.stringify(publicPath)
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5idWlsZC5jb25maWcudHMiLCAidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3F1YW4vZ2hjbG91ZC9sZWdhY3kvc2VjdXJpdHktbW9uaXRvci1taWdyYXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvcXVhbi9naGNsb3VkL2xlZ2FjeS9zZWN1cml0eS1tb25pdG9yLW1pZ3JhdGUvdml0ZS5idWlsZC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3F1YW4vZ2hjbG91ZC9sZWdhY3kvc2VjdXJpdHktbW9uaXRvci1taWdyYXRlL3ZpdGUuYnVpbGQuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IGdldEJhc2VDb25maWcgfSBmcm9tICcuL3ZpdGUuY29uZmlnJ1xuaW1wb3J0IHBrZyBmcm9tICcuL3BhY2thZ2UuanNvbidcblxuXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhhc3luYyAoY29uZmlnRW52KSA9PiB7XG4gIGNvbnN0IGJhc2VDb25maWcgPSBhd2FpdCBnZXRCYXNlQ29uZmlnKGNvbmZpZ0VudilcbiAgcmV0dXJuIHtcbiAgICAuLi5iYXNlQ29uZmlnLFxuICAgIGJ1aWxkOiB7XG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1toYXNoXS5qcycsXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdhc3NldHMvW2hhc2hdLltleHRdJyxcbiAgICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9baGFzaF0uanMnLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgfVxufSlcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3F1YW4vZ2hjbG91ZC9sZWdhY3kvc2VjdXJpdHktbW9uaXRvci1taWdyYXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvcXVhbi9naGNsb3VkL2xlZ2FjeS9zZWN1cml0eS1tb25pdG9yLW1pZ3JhdGUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3F1YW4vZ2hjbG91ZC9sZWdhY3kvc2VjdXJpdHktbW9uaXRvci1taWdyYXRlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4J1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IHR5cGUgQ29uZmlnRW52LCB0eXBlIFVzZXJDb25maWcsIGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcWlhbmt1biBmcm9tICd2aXRlLXBsdWdpbi1xaWFua3VuJ1xuaW1wb3J0IHB1Z1BsdWdpbiBmcm9tICd2dWUtcHVnLXBsdWdpbidcbmltcG9ydCB2dWVQbHVnaW4gZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHBrZyBmcm9tICcuL3BhY2thZ2UuanNvbidcbmltcG9ydCB7IGNyZWF0ZUh0bWxQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1odG1sJ1xuY29uc3QgY29uZmlnID0gYXdhaXQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKVxuICBjb25zdCBwdWJsaWNQYXRoID0gZW52LlBVQkxJQ19QQVRIID8/ICcvJ1xuICBjb25zdCBwcm9qZWN0TmFtZSA9IHBrZy5uYW1lLnJlcGxhY2UoJ0BnaGNsb3VkLWxlZ2FjeS8nLCAnJylcbiAgY29uc3QgY29udGFpbmVySWQgPSBgIyR7ZW52LlZJVEVfQ09OVEFJTkVSX0lEfWBcblxuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtcbiAgICAgIHZ1ZVBsdWdpbih7XG4gICAgICAgIHRlbXBsYXRlOiB7XG4gICAgICAgICAgcHJlcHJvY2Vzc09wdGlvbnM6IHtcbiAgICAgICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICAgICAgcHVnUGx1Z2luXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIHZ1ZUpzeCgpLFxuICAgICAgY3JlYXRlSHRtbFBsdWdpbih7XG4gICAgICAgIGluamVjdDoge1xuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHZlcnNpb246cGtnLnZlcnNpb25cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgcWlhbmt1bihwcm9qZWN0TmFtZSwge1xuICAgICAgICB1c2VEZXZNb2RlOiB0cnVlLFxuICAgICAgfSksXG4gICAgXSxcbiAgICBjc3M6IHtcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgICAgbGVzczoge1xuICAgICAgICAgIGFkZGl0aW9uYWxEYXRhOiBbXG4gICAgICAgICAgICAnQGltcG9ydCBcIkBnaGNsb3VkL2N1YmUtdGhlbWUvZHluYW1pYy1zdHlsZS9hbnRkMy12YXJsYWJsZS5sZXNzXCI7QGltcG9ydCBcIkBnaGNsb3VkLWxlZ2FjeS9iaW1vcHMtZmUtd2ViLW1pZ3JhdGUtbGliL3N0eWxlcy9iYXNlLmxlc3NcIjsnLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgbW9kaWZ5VmFyczoge1xuICAgICAgICAgICAgJ0BhbnQtcHJlZml4JzogcHJvamVjdE5hbWUsXG4gICAgICAgICAgICAnQHJvb3QtZW50cnktbmFtZSc6ICd2YXJpYWJsZScsXG4gICAgICAgICAgICAnQGN1YmUtdGhlbWUtYW50ZDMtcHJlZml4JzogcHJvamVjdE5hbWUsXG4gICAgICAgICAgICAnQGN1YmUtdGhlbWUtYW50ZDMtc2NvcGUtc2VsZWN0b3InOiBjb250YWluZXJJZFxuICAgICAgICAgIH0sXG4gICAgICAgICAgamF2YXNjcmlwdEVuYWJsZWQ6IHRydWVcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9LFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgICAgIFwifmJhc3Njc3NcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL25vZGVfbW9kdWxlcy9iYXNzY3NzXCIpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGJhc2U6IHB1YmxpY1BhdGgsXG4gICAgZGVmaW5lOiB7XG4gICAgICAvKipcbiAgICAgICAqID4gU3RyaW5nIFx1NTAzQ1x1NEYxQVx1NEVFNVx1NTM5Rlx1NTlDQlx1ODg2OFx1OEZCRVx1NUYwRlx1NUY2Mlx1NUYwRlx1NEY3Rlx1NzUyOFx1RkYwQ1x1NjI0MFx1NEVFNVx1NTk4Mlx1Njc5Q1x1NUI5QVx1NEU0OVx1NEU4Nlx1NEUwMFx1NEUyQVx1NUI1N1x1N0IyNlx1NEUzMlx1NUUzOFx1OTFDRlx1RkYwQ1x1NUI4M1x1OTcwMFx1ODk4MVx1ODhBQlx1NjYzRVx1NUYwRlx1NTczMFx1NjI1M1x1NUYxNVx1NTNGN1x1MzAwMlx1RkYwOFx1NEY4Qlx1NTk4Mlx1NEY3Rlx1NzUyOCBgSlNPTi5zdHJpbmdpZnlgXHVGRjA5XG4gICAgICAgKiBcbiAgICAgICAqIFtcdTUzQzJcdTgwMDNdKGh0dHBzOi8vY24udml0ZWpzLmRldi9jb25maWcvc2hhcmVkLW9wdGlvbnMuaHRtbCNkZWZpbmUpXG4gICAgICAgKi9cbiAgICAgIF9fQ09OVEFJTkVSX0lEX186IEpTT04uc3RyaW5naWZ5KGNvbnRhaW5lcklkKSxcbiAgICAgIF9fUFVCTElDX1BBVEhfXzogSlNPTi5zdHJpbmdpZnkocHVibGljUGF0aCksXG4gICAgfVxuICB9XG59KVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QmFzZUNvbmZpZyAoZW52OiBDb25maWdFbnYpOiBQcm9taXNlPFVzZXJDb25maWc+IHtcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gY29uZmlnKGVudilcbiAgfVxuICByZXR1cm4gY29uZmlnXG59XG4iLCAie1xuICBcIm5hbWVcIjogXCJAZ2hjbG91ZC1sZWdhY3kvc2VjdXJpdHktbW9uaXRvci1taWdyYXRlXCIsXG4gIFwicHJpdmF0ZVwiOiBmYWxzZSxcbiAgXCJ2ZXJzaW9uXCI6IFwiMS41LjI0XCIsXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxuICBcInB1Ymxpc2hDb25maWdcIjoge1xuICAgIFwicmVnaXN0cnlcIjogXCJodHRwOi8vbmV4dXMuZ3VoZWNsb3VkLmNvbTo4ODg4L3JlcG9zaXRvcnkvbnBtLWhvc3RlZC9cIlxuICB9LFxuICBcImZpbGVzXCI6IFtcbiAgICBcImRpc3QvXCJcbiAgXSxcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcImRldlwiOiBcInZpdGUgLWMgdml0ZS5kZXYuY29uZmlnLnRzXCIsXG4gICAgXCJidWlsZFwiOiBcInZpdGUgYnVpbGQgLWMgdml0ZS5idWlsZC5jb25maWcudHNcIixcbiAgICBcImJ1aWxkOmRldlwiOiBcInZpdGUgYnVpbGQgLWMgdml0ZS5idWlsZC5jb25maWcudHMgLS1tb2RlIGRldlwiLFxuICAgIFwiYnVpbGQ6dGVzdFwiOiBcInZpdGUgYnVpbGQgLWMgdml0ZS5idWlsZC5jb25maWcudHMgLS1tb2RlIHRlc3RcIixcbiAgICBcImJ1aWxkOnByb2RcIjogXCJ2aXRlIGJ1aWxkIC1jIHZpdGUuYnVpbGQuY29uZmlnLnRzIC0tbW9kZSBwcm9kXCIsXG4gICAgXCJidWlsZDpwcmV2aWV3XCI6IFwidml0ZSBidWlsZCAtYyB2aXRlLmJ1aWxkLmNvbmZpZy50cyAtLW1vZGUgcHJldmlld1wiLFxuICAgIFwicHJldmlld1wiOiBcInZpdGUgcHJldmlldyAtYyB2aXRlLnByZXZpZXcuY29uZmlnLnRzXCIsXG4gICAgXCJsaW50XCI6IFwiZXNsaW50IC4gLS1pZ25vcmUtcGF0aCAuZ2l0aWdub3JlIC0tZml4XCJcbiAgfSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGdoY2xvdWQvY3ViZS1wbGF5ZXJcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwiQGFudC1kZXNpZ24vaWNvbnMtdnVlXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcIkBnaGNsb3VkL2N1YmUtbWRhdGEtc2VydmljZVwiOiBcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJAZ2hjbG91ZC9jdWJlLWFsYXJtLWNlbnRlci1zZXJ2aWNlXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcIkBnaGNsb3VkL2N1YmUtb3VhYS1zZXJ2aWNlXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcIkBnaGNsb3VkL2N1YmUtYWxhcm0tY2hhcnRzXCI6XCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwiQGdoY2xvdWQvY3ViZS1maWxlLXNlcnZpY2VcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwiQGdoY2xvdWQvY3ViZS1pb3QtY2VudGVyLXNlcnZpY2VcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwiQGdoY2xvdWQvY3ViZS10aGVtZVwiOiBcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJAZ2hjbG91ZC9jdWJlLXVpXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcIkBnaGNsb3VkL2N1YmUtbWYtcm9vdFwiOiBcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJAZ2hjbG91ZC1sZWdhY3kvYmltb3BzLWZlLXdlYi1taWdyYXRlLWxpYlwiOiBcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJAcGFuc3kvcmVwbGFjZS1vYmplY3Qta2V5c1wiOiBcIl4wLjUuMFwiLFxuICAgIFwiQHBhbnN5L3V0aWxzXCI6IFwiXjAuNS4xXCIsXG4gICAgXCJhbnQtZGVzaWduLXZ1ZVwiOiBcIjIuMi44XCIsXG4gICAgXCJhbnRkLXRoZW1lLWdlbmVyYXRvclwiOiBcIjEuMi4xMFwiLFxuICAgIFwiYXhpb3NcIjogXCJeMC4yMS4xXCIsXG4gICAgXCJiYXNzY3NzXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcImNvcmUtanNcIjogXCJeMy42LjVcIixcbiAgICBcImVjaGFydHNcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwiZmlsZS1zYXZlclwiOiBcIl4yLjAuNVwiLFxuICAgIFwiaHRtbDJjYW52YXNcIjogXCJeMS40LjFcIixcbiAgICBcImpzLWJhc2U2NFwiOiBcIl4zLjYuMVwiLFxuICAgIFwianNwZGZcIjogXCJeMi41LjFcIixcbiAgICBcImpzemlwXCI6IFwiXjMuNy4xXCIsXG4gICAgXCJsb2Rhc2hcIjogXCJeNC4xNy4yMVwiLFxuICAgIFxuICAgIFwibG9kYXNoLWVzXCI6IFwiXjQuMTcuMjFcIixcbiAgICBcIm1vbWVudFwiOiBcIl4yLjI5LjFcIixcbiAgICBcInBhdGhcIjogXCJeMC4xMi43XCIsXG4gICAgXCJxcmNvZGVqczJcIjogXCJeMC4wLjJcIixcbiAgICBcInFzXCI6IFwiXjYuMTAuMVwiLFxuICAgIFwic29ydGFibGVqc1wiOiBcIl4xLjE0LjBcIixcbiAgICBcInZ1ZVwiOiBcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJAZ2hjbG91ZC9jdWJlLXV0aWxzXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcInZ1ZS1hbWFwXCI6IFwiXjAuNS4xMFwiLFxuXG4gICAgXCJ2dWUtbW9ub3BsYXN0eS1zbGlkZS12ZXJpZnlcIjogXCJeMS4xLjNcIixcbiAgICBcInZ1ZS1yb3V0ZXJcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwidnVlZHJhZ2dhYmxlXCI6IFwiXjIuMjQuM1wiLFxuICAgIFwidnVlZHJhZ2dhYmxlLWVzXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcInZ1ZXhcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwid2FuZ2VkaXRvclwiOiBcIl40LjcuMTFcIlxuICB9LFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAZ2hjbG91ZC9lc2xpbnQtY29uZmlnLXN0YW5kYXJkLXZ1ZTNcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwiQHR5cGVzL25vZGVcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXZ1ZS1qc3hcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwiZXNsaW50XCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcImxlc3NcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwidHlwZXNjcmlwdFwiOiBcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJ2aXRlXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcInZpdGUtcGx1Z2luLXFpYW5rdW5cIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwidnVlLXB1Zy1wbHVnaW5cIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwidnVlLXRzY1wiOiBcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJ2aXRlLXBsdWdpbi1odG1sXCI6IFwid29ya3NwYWNlOl5cIlxuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVWLFNBQVMsZ0JBQUFBLHFCQUFvQjs7O0FDQXpDLE9BQU8sWUFBWTtBQUM5VixPQUFPLFVBQVU7QUFDakIsU0FBMEMsY0FBYyxlQUFlO0FBQ3ZFLE9BQU8sYUFBYTtBQUNwQixPQUFPLGVBQWU7QUFDdEIsT0FBTyxlQUFlOzs7QUNMdEI7QUFBQSxFQUNFLE1BQVE7QUFBQSxFQUNSLFNBQVc7QUFBQSxFQUNYLFNBQVc7QUFBQSxFQUNYLE1BQVE7QUFBQSxFQUNSLGVBQWlCO0FBQUEsSUFDZixVQUFZO0FBQUEsRUFDZDtBQUFBLEVBQ0EsT0FBUztBQUFBLElBQ1A7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFXO0FBQUEsSUFD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
