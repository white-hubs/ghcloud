import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import unpluginVueComponent from "unplugin-vue-components/vite";
import vueMacros from "unplugin-vue-macros/dist/vite";
import { defineConfig, loadEnv } from "vite";
import { presetAttributify, presetIcons, presetUno } from 'unocss'
import { version } from "./package.json";
import { antDesignVue3Resolver } from "./vite-plugin/unplugin-vue-components/antdv3/resolver";
import Unocss from "unocss/vite";
import { createHtmlPlugin } from "vite-plugin-html";
import qiankun from "vite-plugin-qiankun";

const projectName = "electronic-patrol";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicPath = env.PUBLIC_PATH ?? "/";

  return {
    plugins: [
      Unocss({
        presets: [
          presetUno(),
          presetAttributify(),
          presetIcons()
        ],
      }),
      vueMacros({
        plugins: {
          vue: vue(),
          vueJsx: vueJsx(),
        },
      }),
      createHtmlPlugin({
        inject: {
          data: {
            version,
          },
        },
      }),
      unpluginVueComponent({
        dts: true,
        resolvers: [
          antDesignVue3Resolver({
            resolveIcons: true,
            importStyle: false, // ant-design-vue 4.x 使用 CSS-in-JS，无需按需引入样式
            cjs: false,
          }),
        ],
      }),
      qiankun(projectName, {
        useDevMode: true,
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: [
            '@import "@ghcloud/cube-theme/dynamic-style/antd3-varlable.less";',
            // '@import "@ghcloud/cube-ui/lib/style.css";',
          ],
          modifyVars: {
            "@cube-ui-prefix": projectName,
            "@ant-prefix": projectName,
            "@root-entry-name": "variable",
            "@cube-theme-antd3-prefix": projectName,
            "@cube-theme-antd3-scope-selector": "#TemplateApp",
          },
          // 开启 less js 支持以解决 antdv3 less 样式编译问题
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: "assets/[hash].js",
          assetFileNames: "assets/[hash].[ext]",
          entryFileNames: "assets/[hash].js",
        },
      },
    },
    base: publicPath,
    server: {
      host: "0.0.0.0",
      origin: "//localhost:3200",
      port: 8888,
      headers: {
        "Accsee-Control-Allow-Origin": "*",
      },
      hmr: true,
    },
    preview: {
      port: 5050,
    },
  };
});
