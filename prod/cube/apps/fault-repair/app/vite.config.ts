import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import { type ConfigEnv, type Plugin, type UserConfig, defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

import { version } from "./package.json";

const appSrc = path.resolve(__dirname, "./src");
const streamengineRoot = path.resolve(__dirname, "../../../../../legacy/streamengine-pc-migrate");
const streamengineSrc = path.join(streamengineRoot, "src");

/**
 * 统一处理 `@/`：
 * - streamengine 源码 → legacy/.../src
 * - 其余 → 本应用 src
 * 必须用插件而非 resolve.alias，否则 vite 内置 alias 会抢先把 `@/` 指到本应用。
 */
function atSrcAlias(): Plugin {
  return {
    name: "fault-repair-at-src-alias",
    enforce: "pre",
    async resolveId(id, importer, options) {
      if (!id.startsWith("@/")) return;
      const normalizedImporter = (importer ?? "").replace(/\\/g, "/");
      const base = normalizedImporter.includes("/streamengine-pc-migrate/") ? streamengineSrc : appSrc;
      const target = path.resolve(base, id.slice(2));
      return await this.resolve(target, importer, { ...options, skipSelf: true });
    },
  };
}

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";
  const projectName = "cube-fault-repair-app";

  return {
    plugins: [
      atSrcAlias(),
      vue(),
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
            "@cube-theme-antd3-scope-selector": "#cube-fault-repair-app",
          },
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        "@ghcloud-legacy/streamengine-pc-migrate": streamengineRoot,
      },
      dedupe: ["vue", "vue-router", "pinia", "ant-design-vue"],
    },
    base: publicPath,
  };
});

export async function getBaseConfig(env: ConfigEnv): Promise<UserConfig> {
  if (typeof config === "function") {
    return config(env);
  }
  return config;
}
