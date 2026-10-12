import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";
const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/res";
  const projectName = "iot-configure";

  return {
    plugins: [vueJsx()],
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            "@cube-ui-prefix": projectName,
            "@ant-prefix": projectName,
            "@root-entry-name": "variable",
            "@cube-theme-antd3-prefix": projectName,
            "@cube-theme-antd3-scope-selector": "#IotConfigureAPP",
          },
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: publicPath,
    optimizeDeps: {
      exclude: ["@ghcloud/cube-ui"],
    },
    serviceUrl: env.VUE_APP_SERVICE_URL,
  };
});

export async function getBaseConfig(env: ConfigEnv): Promise<UserConfig> {
  if (typeof config === "function") {
    return config(env);
  }
  return config;
}
