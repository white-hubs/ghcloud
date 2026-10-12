import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

import { version } from "./package.json";

const projectName = "warehouse-safety";

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  return {
    plugins: [
      vueJsx(),
      createHtmlPlugin({
        inject: {
          data: {
            version,
          },
        },
      }),
      qiankun(projectName, {
        useDevMode: true,
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: ['@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";'],
          modifyVars: {
            "@cube-ui-prefix": projectName,
            "@ant-prefix": projectName,
            "@root-entry-name": "variable",
            "@cube-theme-antd3-prefix": projectName,
            "@cube-theme-antd3-scope-selector": "#cube-warehouse-safety-app",
          },
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@ghcloud/cube-services-client/warehouse-safety.client": path.resolve(
          __dirname,
          "../../../../cube-services/client/src/warehouse-safety.client.ts",
        ),
        "@ghcloud/cube-alarm-center-service": path.resolve(__dirname, "../../alarm-center/service/src/main.ts"),
        "@ghcloud/cube-iot-socket": path.resolve(__dirname, "../../../basic/cube-iot-socket/src/main.ts"),
        "@ghcloud/cube-map-plugins": path.resolve(__dirname, "../../../basic/cube-map-plugins/src/main.ts"),
        "@ghcloud/generic-component": path.resolve(__dirname, "../../../business/generic-component/src/main.ts"),
        leaflet: path.resolve(__dirname, "../../../../../node_modules/.bun/leaflet@1.9.4/node_modules/leaflet"),
        "leaflet-rotate": path.resolve(
          __dirname,
          "../../../../../node_modules/.bun/leaflet-rotate@0.2.8+1e8d59341e2dedda/node_modules/leaflet-rotate/dist/leaflet-rotate-src.js",
        ),
      },
    },
    base: publicPath,
    define: {
      __ENV__: { applicationCode: "WAREHOUSE_SAFETY" },
    },
  };
});

export async function getBaseConfig(env: ConfigEnv): Promise<UserConfig> {
  if (typeof config === "function") {
    return config(env);
  }
  return config;
}
