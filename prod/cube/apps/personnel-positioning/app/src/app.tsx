import { qiankunWindow } from "vite-plugin-qiankun/dist/helper";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";

import { ConfigProvider } from "@ghcloud/cube-ui";

import { useTeleportThemeVars } from "@/hooks/use-teleport-theme-vars";

import "@/assets/style.less";

export const App = defineComponent({
  name: "PersonnelPositioning",
  setup: () => {
    useTeleportThemeVars();
    const standalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
    return () => (
      <ConfigProvider prefixCls="ant" theme={{ token: { colorPrimary: "#1890ff" } }}>
        <div class={["pp-app", { "pp-app-standalone": standalone }]}>
          <main class="pp-workspace">
            <RouterView />
          </main>
        </div>
      </ConfigProvider>
    );
  },
});
