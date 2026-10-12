import vueJsx from "@vitejs/plugin-vue-jsx";
import { createRequire } from "node:module";
import path from "node:path";
import { type ConfigEnv, type UserConfig, defineConfig } from "vite";

const require = createRequire(import.meta.url);
/** icons-vue 嵌套依赖在 Rolldown 下可能无法解析 @ctrl/tinycolor，改从 ant-design-vue 依赖树定位 */
const requireFromAntDesignVue = createRequire(require.resolve("ant-design-vue/package.json"));
const tinycolorDir = path.dirname(requireFromAntDesignVue.resolve("@ctrl/tinycolor/package.json"));

const config = defineConfig((): UserConfig => {
  return {
    plugins: [vueJsx()],
    resolve: {
      alias: {
        "@ctrl/tinycolor": tinycolorDir,
        "@": path.resolve(__dirname, "./src"),
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
