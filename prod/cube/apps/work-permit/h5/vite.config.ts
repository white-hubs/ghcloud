import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { createRequire } from "node:module";
import path from "path";
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from "vite";

const require = createRequire(import.meta.url);
const vueDir = path.dirname(require.resolve("vue/package.json"));
const vueRouterDir = path.dirname(require.resolve("vue-router/package.json"));
const cubeAppGenericComponentDir = path.resolve(__dirname, "../../../basic/cube-app-generic-component/src/main.ts");

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";

  return {
    plugins: [vueJsx(), vue()],
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        vue: vueDir,
        "vue-router": vueRouterDir,
        "@ghcloud/cube-app-generic-component": cubeAppGenericComponentDir,
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["vue", "vue-router", "pinia"],
    },
    base: publicPath,
    define: {
      __ENV__: {
        applicationCode: "WORK_PERMIT_MANAGE",
      },
    },
  };
});

export async function getBaseConfig(env: ConfigEnv): Promise<UserConfig> {
  if (typeof config === "function") {
    return config(env);
  }
  return config;
}
export default config;
