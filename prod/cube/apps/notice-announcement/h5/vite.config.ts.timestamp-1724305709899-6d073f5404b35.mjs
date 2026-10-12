// vite.config.ts
import vueJsx from "file:///Users/whkuan/Desktop/WHK/ghcloud/ghcloud/node_modules/.pnpm/@vitejs+plugin-vue-jsx@3.1.0_vite@4.5.1_vue@3.3.9/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import path from "path";
import { defineConfig, loadEnv } from "file:///Users/whkuan/Desktop/WHK/ghcloud/ghcloud/node_modules/.pnpm/vite@4.5.1_@types+node@20.9.0_less@4.2.0_terser@5.31.0/node_modules/vite/dist/node/index.js";
import Components from "file:///Users/whkuan/Desktop/WHK/ghcloud/ghcloud/node_modules/.pnpm/unplugin-vue-components@0.26.0_vue@3.3.9/node_modules/unplugin-vue-components/dist/vite.js";
import { VantResolver } from "file:///Users/whkuan/Desktop/WHK/ghcloud/ghcloud/node_modules/.pnpm/@vant+auto-import-resolver@1.1.0/node_modules/@vant/auto-import-resolver/dist/index.esm.mjs";
import { viteVConsole } from "file:///Users/whkuan/Desktop/WHK/ghcloud/ghcloud/node_modules/.pnpm/vite-plugin-vconsole@1.3.1/node_modules/vite-plugin-vconsole/dist/index.mjs";
import legacy from "file:///Users/whkuan/Desktop/WHK/ghcloud/ghcloud/node_modules/.pnpm/@vitejs+plugin-legacy@4.1.1_terser@5.31.0_vite@4.5.1/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
import postcsspxtoviewport from "file:///Users/whkuan/Desktop/WHK/ghcloud/ghcloud/node_modules/.pnpm/postcss-px-to-viewport@1.1.1/node_modules/postcss-px-to-viewport/index.js";
import { createHtmlPlugin } from "file:///Users/whkuan/Desktop/WHK/ghcloud/ghcloud/node_modules/.pnpm/vite-plugin-html@3.2.0_vite@4.5.1/node_modules/vite-plugin-html/dist/index.mjs";

// package.json
var version = "1.0.2";

// vite.config.ts
var __vite_injected_original_dirname = "/Users/whkuan/Desktop/WHK/ghcloud/ghcloud/prod/cube/apps/notice-announcement/h5";
var config = await defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const vConsoleEnable = env.V_CONSOLE === "true";
  const publicPath = env.PUBLIC_PATH ?? "/";
  return {
    plugins: [
      vueJsx(),
      // eslintPlugin({
      //   include: ['src/**/*.{ts,tsx}'],
      // }),
      Components({
        resolvers: [VantResolver({ importStyle: "css" })]
      }),
      createHtmlPlugin({
        inject: {
          data: {
            version
          }
        }
      }),
      viteVConsole({
        entry: path.resolve(__vite_injected_original_dirname, "src/main.ts"),
        localEnabled: vConsoleEnable,
        enabled: vConsoleEnable,
        config: {
          theme: "dark"
        }
      }),
      legacy({
        targets: ["chrome 48"],
        additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
        renderLegacyChunks: true,
        polyfills: ["es.array.flat", "es.array.flat-map", "es.symbol", "es.array.filter", "es.promise", "es.promise.finally", "es/map", "es/set", "es.array.for-each", "es.object.define-properties", "es.object.define-property", "es.object.get-own-property-descriptor", "es.object.get-own-property-descriptors", "es.object.keys", "es.object.to-string", "web.dom-collections.for-each", "esnext.global-this", "esnext.string.match-all", "es.object.entries", "es.object.from-entries", "esnext.object.iterate-entries"]
      })
    ],
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        }
      },
      postcss: {
        plugins: [
          postcsspxtoviewport({
            unitToConvert: "px",
            // 要转化的单位
            viewportWidth: 375,
            // UI设计稿的宽度
            unitPrecision: 6,
            // 转换后的精度，即小数点位数
            propList: ["*"],
            // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换
            viewportUnit: "vw",
            // 指定需要转换成的视窗单位，默认vw
            fontViewportUnit: "vw",
            // 指定字体需要转换成的视窗单位，默认vw
            selectorBlackList: ["ignore-"],
            // 指定不转换为视窗单位的类名，
            minPixelValue: 1,
            // 默认值1，小于或等于1px则不进行转换
            mediaQuery: false,
            // 是否在媒体查询的css代码中也进行转换，默认false
            replace: true,
            // 是否转换后直接更换属性值
            landscape: false
            // 是否处理横屏情况
          })
        ]
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
        baseApiUrl: "/api",
        authHeaders: env.AUTH_HEADERS !== void 0 ? JSON.parse(env.AUTH_HEADERS) : void 0,
        appUser: env.APP_USER !== void 0 ? JSON.parse(env.APP_USER) : void 0
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
var vite_config_default = config;
export {
  vite_config_default as default,
  getBaseConfig
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3doa3Vhbi9EZXNrdG9wL1dISy9naGNsb3VkL2doY2xvdWQvcHJvZC9jdWJlL2FwcHMvbm90aWNlLWFubm91bmNlbWVudC9oNVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3doa3Vhbi9EZXNrdG9wL1dISy9naGNsb3VkL2doY2xvdWQvcHJvZC9jdWJlL2FwcHMvbm90aWNlLWFubm91bmNlbWVudC9oNS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvd2hrdWFuL0Rlc2t0b3AvV0hLL2doY2xvdWQvZ2hjbG91ZC9wcm9kL2N1YmUvYXBwcy9ub3RpY2UtYW5ub3VuY2VtZW50L2g1L3ZpdGUuY29uZmlnLnRzXCI7LyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L2F3YWl0LXRoZW5hYmxlICovXG5pbXBvcnQgdnVlSnN4IGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZS1qc3gnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgdHlwZSBDb25maWdFbnYsIHR5cGUgVXNlckNvbmZpZywgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcbi8vIGltcG9ydCBlc2xpbnRQbHVnaW4gZnJvbSAndml0ZS1wbHVnaW4tZXNsaW50J1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcbmltcG9ydCB7IFZhbnRSZXNvbHZlciB9IGZyb20gJ0B2YW50L2F1dG8taW1wb3J0LXJlc29sdmVyJ1xuaW1wb3J0IHsgdml0ZVZDb25zb2xlIH0gZnJvbSAndml0ZS1wbHVnaW4tdmNvbnNvbGUnXG5pbXBvcnQgbGVnYWN5IGZyb20gJ0B2aXRlanMvcGx1Z2luLWxlZ2FjeSdcbmltcG9ydCBwb3N0Y3NzcHh0b3ZpZXdwb3J0IGZyb20gJ3Bvc3Rjc3MtcHgtdG8tdmlld3BvcnQnXG5pbXBvcnQgeyBjcmVhdGVIdG1sUGx1Z2luIH0gZnJvbSAndml0ZS1wbHVnaW4taHRtbCdcbmltcG9ydCB7IHZlcnNpb24gfSBmcm9tICcuL3BhY2thZ2UuanNvbidcbmNvbnN0IGNvbmZpZyA9IGF3YWl0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJylcbiAgY29uc3QgdkNvbnNvbGVFbmFibGUgPSBlbnYuVl9DT05TT0xFID09PSAndHJ1ZSdcbiAgY29uc3QgcHVibGljUGF0aCA9IGVudi5QVUJMSUNfUEFUSCA/PyAnLydcbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICB2dWVKc3goKSxcbiAgICAgIC8vIGVzbGludFBsdWdpbih7XG4gICAgICAvLyAgIGluY2x1ZGU6IFsnc3JjLyoqLyoue3RzLHRzeH0nXSxcbiAgICAgIC8vIH0pLFxuICAgICAgQ29tcG9uZW50cyh7XG4gICAgICAgIHJlc29sdmVyczogW1ZhbnRSZXNvbHZlcih7IGltcG9ydFN0eWxlOiAnY3NzJyB9KV1cbiAgICAgIH0pLFxuICAgICAgY3JlYXRlSHRtbFBsdWdpbih7XG4gICAgICAgIGluamVjdDoge1xuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHZlcnNpb25cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgdml0ZVZDb25zb2xlKHtcbiAgICAgICAgZW50cnk6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvbWFpbi50cycpLFxuICAgICAgICBsb2NhbEVuYWJsZWQ6IHZDb25zb2xlRW5hYmxlLFxuICAgICAgICBlbmFibGVkOiB2Q29uc29sZUVuYWJsZSxcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgdGhlbWU6ICdkYXJrJ1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIGxlZ2FjeSh7XG4gICAgICAgIHRhcmdldHM6IFsnY2hyb21lIDQ4J10sXG4gICAgICAgIGFkZGl0aW9uYWxMZWdhY3lQb2x5ZmlsbHM6IFsncmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lJ10sXG4gICAgICAgIHJlbmRlckxlZ2FjeUNodW5rczogdHJ1ZSxcbiAgICAgICAgcG9seWZpbGxzOiBbJ2VzLmFycmF5LmZsYXQnLCAnZXMuYXJyYXkuZmxhdC1tYXAnLCAnZXMuc3ltYm9sJywgJ2VzLmFycmF5LmZpbHRlcicsICdlcy5wcm9taXNlJywgJ2VzLnByb21pc2UuZmluYWxseScsICdlcy9tYXAnLCAnZXMvc2V0JywgJ2VzLmFycmF5LmZvci1lYWNoJywgJ2VzLm9iamVjdC5kZWZpbmUtcHJvcGVydGllcycsICdlcy5vYmplY3QuZGVmaW5lLXByb3BlcnR5JywgJ2VzLm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3InLCAnZXMub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcnMnLCAnZXMub2JqZWN0LmtleXMnLCAnZXMub2JqZWN0LnRvLXN0cmluZycsICd3ZWIuZG9tLWNvbGxlY3Rpb25zLmZvci1lYWNoJywgJ2VzbmV4dC5nbG9iYWwtdGhpcycsICdlc25leHQuc3RyaW5nLm1hdGNoLWFsbCcsICdlcy5vYmplY3QuZW50cmllcycsICdlcy5vYmplY3QuZnJvbS1lbnRyaWVzJywgJ2VzbmV4dC5vYmplY3QuaXRlcmF0ZS1lbnRyaWVzJ11cbiAgICAgIH0pLFxuICAgIF0sXG4gICAgY3NzOiB7XG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICAgIGxlc3M6IHtcbiAgICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgcG9zdGNzczoge1xuICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtY2FsbFxuICAgICAgICAgIHBvc3Rjc3NweHRvdmlld3BvcnQoe1xuICAgICAgICAgICAgdW5pdFRvQ29udmVydDogJ3B4JywgLy8gXHU4OTgxXHU4RjZDXHU1MzE2XHU3Njg0XHU1MzU1XHU0RjREXG4gICAgICAgICAgICB2aWV3cG9ydFdpZHRoOiAzNzUsIC8vIFVJXHU4QkJFXHU4QkExXHU3QTNGXHU3Njg0XHU1QkJEXHU1RUE2XG4gICAgICAgICAgICB1bml0UHJlY2lzaW9uOiA2LCAvLyBcdThGNkNcdTYzNjJcdTU0MEVcdTc2ODRcdTdDQkVcdTVFQTZcdUZGMENcdTUzNzNcdTVDMEZcdTY1NzBcdTcwQjlcdTRGNERcdTY1NzBcbiAgICAgICAgICAgIHByb3BMaXN0OiBbJyonXSwgLy8gXHU2MzA3XHU1QjlBXHU4RjZDXHU2MzYyXHU3Njg0Y3NzXHU1QzVFXHU2MDI3XHU3Njg0XHU1MzU1XHU0RjREXHVGRjBDKlx1NEVFM1x1ODg2OFx1NTE2OFx1OTBFOGNzc1x1NUM1RVx1NjAyN1x1NzY4NFx1NTM1NVx1NEY0RFx1OTBGRFx1OEZEQlx1ODg0Q1x1OEY2Q1x1NjM2MlxuICAgICAgICAgICAgdmlld3BvcnRVbml0OiAndncnLCAvLyBcdTYzMDdcdTVCOUFcdTk3MDBcdTg5ODFcdThGNkNcdTYzNjJcdTYyMTBcdTc2ODRcdTg5QzZcdTdBOTdcdTUzNTVcdTRGNERcdUZGMENcdTlFRDhcdThCQTR2d1xuICAgICAgICAgICAgZm9udFZpZXdwb3J0VW5pdDogJ3Z3JywgLy8gXHU2MzA3XHU1QjlBXHU1QjU3XHU0RjUzXHU5NzAwXHU4OTgxXHU4RjZDXHU2MzYyXHU2MjEwXHU3Njg0XHU4OUM2XHU3QTk3XHU1MzU1XHU0RjREXHVGRjBDXHU5RUQ4XHU4QkE0dndcbiAgICAgICAgICAgIHNlbGVjdG9yQmxhY2tMaXN0OiBbJ2lnbm9yZS0nXSwgLy8gXHU2MzA3XHU1QjlBXHU0RTBEXHU4RjZDXHU2MzYyXHU0RTNBXHU4OUM2XHU3QTk3XHU1MzU1XHU0RjREXHU3Njg0XHU3QzdCXHU1NDBEXHVGRjBDXG4gICAgICAgICAgICBtaW5QaXhlbFZhbHVlOiAxLCAvLyBcdTlFRDhcdThCQTRcdTUwM0MxXHVGRjBDXHU1QzBGXHU0RThFXHU2MjE2XHU3QjQ5XHU0RThFMXB4XHU1MjE5XHU0RTBEXHU4RkRCXHU4ODRDXHU4RjZDXHU2MzYyXG4gICAgICAgICAgICBtZWRpYVF1ZXJ5OiBmYWxzZSwgLy8gXHU2NjJGXHU1NDI2XHU1NzI4XHU1QTkyXHU0RjUzXHU2N0U1XHU4QkUyXHU3Njg0Y3NzXHU0RUUzXHU3ODAxXHU0RTJEXHU0RTVGXHU4RkRCXHU4ODRDXHU4RjZDXHU2MzYyXHVGRjBDXHU5RUQ4XHU4QkE0ZmFsc2VcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsIC8vIFx1NjYyRlx1NTQyNlx1OEY2Q1x1NjM2Mlx1NTQwRVx1NzZGNFx1NjNBNVx1NjZGNFx1NjM2Mlx1NUM1RVx1NjAyN1x1NTAzQ1xuICAgICAgICAgICAgbGFuZHNjYXBlOiBmYWxzZSAvLyBcdTY2MkZcdTU0MjZcdTU5MDRcdTc0MDZcdTZBMkFcdTVDNEZcdTYwQzVcdTUxQjVcbiAgICAgICAgICB9KSxcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBiYXNlOiBwdWJsaWNQYXRoLFxuICAgIGRlZmluZToge1xuICAgICAgX19FTlZfXzoge1xuICAgICAgICBiYXNlQXBpVXJsOiAnL2FwaScsXG4gICAgICAgIGF1dGhIZWFkZXJzOiBlbnYuQVVUSF9IRUFERVJTICE9PSB1bmRlZmluZWQgPyBKU09OLnBhcnNlKGVudi5BVVRIX0hFQURFUlMpIDogdW5kZWZpbmVkLFxuICAgICAgICBhcHBVc2VyOiBlbnYuQVBQX1VTRVIgIT09IHVuZGVmaW5lZCA/IEpTT04ucGFyc2UoZW52LkFQUF9VU0VSKSA6IHVuZGVmaW5lZCxcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRCYXNlQ29uZmlnIChlbnY6IENvbmZpZ0Vudik6IFByb21pc2U8VXNlckNvbmZpZz4ge1xuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBjb25maWcoZW52KVxuICB9XG4gIHJldHVybiBjb25maWdcbn1cbmV4cG9ydCBkZWZhdWx0IGNvbmZpZ1xuIiwgIntcbiAgXCJuYW1lXCI6IFwiQGdoY2xvdWQvY3ViZS1ub3RpY2UtYW5ub3VuY2VtZW50LWg1XCIsXG4gIFwicHJpdmF0ZVwiOiBmYWxzZSxcbiAgXCJ2ZXJzaW9uXCI6IFwiMS4wLjJcIixcbiAgXCJ0eXBlXCI6XCJtb2R1bGVcIixcbiAgXCJwdWJsaXNoQ29uZmlnXCI6IHtcbiAgICBcInJlZ2lzdHJ5XCI6IFwiaHR0cDovL2Rldi5ndWhlY2xvdWQuY29tOjgwODIvcmVwb3NpdG9yeS9ucG0taG9zdGVkL1wiXG4gIH0sXG4gIFwiZmlsZXNcIjogW1xuICAgIFwiZGlzdC9cIlxuICBdLFxuICBcInNjcmlwdHNcIjoge1xuICAgIFwiZGV2XCI6IFwidml0ZSAtYyB2aXRlLmRldi5jb25maWcudHMgLS1tb2RlIGRldlwiLFxuICAgIFwiYnVpbGRcIjogXCJ2aXRlIGJ1aWxkXCIsXG4gICAgXCJidWlsZDpkZXZcIjogXCJ2aXRlIGJ1aWxkIC0tbW9kZSB0ZXN0XCIsXG4gICAgXCJidWlsZDp0ZXN0XCI6IFwidml0ZSBidWlsZCAtLW1vZGUgdGVzdFwiLFxuICAgIFwiYnVpbGQ6cHJvZFwiOiBcInZpdGUgYnVpbGQgLS1tb2RlIHByb2RcIixcbiAgICBcInByZXZpZXdcIjogXCJ2aXRlIHByZXZpZXcgLWMgdml0ZS5wcmV2aWV3LmNvbmZpZy50c1wiLFxuICAgIFwibGludFwiOiBcImVzbGludCAuIC0taWdub3JlLXBhdGggLmdpdGlnbm9yZSAtLWZpeFwiXG4gIH0sXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBmaW5nZXJwcmludGpzL2ZpbmdlcnByaW50anNcIjogXCI0LjIuMlwiLFxuICAgIFwiQGdoY2xvdWQvY3ViZS1hcHAtanMtc2RrXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcIkBnaGNsb3VkL2N1YmUtYXV0aC11dGlsc1wiOiBcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJAZ2hjbG91ZC9jdWJlLW5vdGljZS1hbm5vdW5jZW1lbnQtc2VydmljZVwiOiBcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJAZ2hjbG91ZC9jdWJlLWJ1bGxldGluLXNlcnZpY2VcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwiQGdoY2xvdWQvY3ViZS1maWxlLXNlcnZpY2VcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwiQGdoY2xvdWQvY3ViZS1vdWFhLXNlcnZpY2VcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwiQGdoY2xvdWQvY3ViZS1tZGF0YS1zZXJ2aWNlXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcIkBnaGNsb3VkL2N1YmUtdXRpbHNcIjpcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJAZ2hjbG91ZC9sb2dnZXJcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwiQHZhbnQvYXV0by1pbXBvcnQtcmVzb2x2ZXJcIjogXCJeMS4wLjFcIixcbiAgICBcImRheWpzXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcImVjaGFydHNcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwibG9kYXNoXCI6IFwiXjQuMTcuMjFcIixcbiAgICBcInZhbnRcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwidnVlXCI6IFwid29ya3NwYWNlOl5cIixcbiAgICBcInZ1ZS1yb3V0ZXJcIjogXCJ3b3Jrc3BhY2U6XlwiLFxuICAgIFwianMtYmFzZTY0XCI6IFwiXjMuNy41XCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGdoY2xvdWQvZXNsaW50LWNvbmZpZy1zdGFuZGFyZC12dWUzLXRzeFwiOiBcIndvcmtzcGFjZTpeXCIsXG4gICAgXCJAdHlwZXMvbG9kYXNoXCI6IFwiXjQuMTcuMVwiLFxuICAgIFwiQHR5cGVzL25vZGVcIjogXCIyMC45LjBcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLWxlZ2FjeVwiOiBcIjQuMS4xXCIsXG4gICAgXCJAdml0ZWpzL3BsdWdpbi12dWUtanN4XCI6IFwiMy4xLjBcIixcbiAgICBcImVzbGludFwiOiBcIjguNTMuMFwiLFxuICAgIFwibGVzc1wiOiBcIjQuMi4wXCIsXG4gICAgXCJwb3N0Y3NzLXB4LXRvLXZpZXdwb3J0XCI6IFwiXjEuMS4xXCIsXG4gICAgXCJ0eXBlc2NyaXB0XCI6IFwiNS4zLjJcIixcbiAgICBcInVucGx1Z2luLXZ1ZS1jb21wb25lbnRzXCI6IFwiMC4yNi4wXCIsXG4gICAgXCJ2Y29uc29sZVwiOiBcIl4zLjE1LjFcIixcbiAgICBcInZpdGVcIjogXCI0LjUuMVwiLFxuICAgIFwidml0ZS1wbHVnaW4tZXNsaW50XCI6IFwiMS44LjFcIixcbiAgICBcInZpdGUtcGx1Z2luLXZjb25zb2xlXCI6IFwiXjEuMy4xXCIsXG4gICAgXCJ2aXRlLXBsdWdpbi1odG1sXCI6IFwid29ya3NwYWNlOl5cIlxuICB9XG59Il0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLE9BQU8sWUFBWTtBQUNuQixPQUFPLFVBQVU7QUFDakIsU0FBMEMsY0FBYyxlQUFlO0FBRXZFLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sWUFBWTtBQUNuQixPQUFPLHlCQUF5QjtBQUNoQyxTQUFTLHdCQUF3Qjs7O0FDUC9CLGNBQVc7OztBREhiLElBQU0sbUNBQW1DO0FBWXpDLElBQU0sU0FBUyxNQUFNLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUM5QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVB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
