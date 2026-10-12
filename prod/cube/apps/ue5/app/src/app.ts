import Antd from "ant-design-vue";
import { createPinia, setActivePinia } from "pinia";
import { createApp, type App } from "vue";

import { licenseCheck } from "@ghcloud/cube-app-design";
import { antd3LegacyThemeManager, themeManager } from "@ghcloud/cube-theme";

import { initAuthStore } from "@/application/auth/auth-store";
import { getSessionAuth, hasAuthSession } from "@/application/auth/session";
import { reportUe5BootProgress } from "@/application/bootstrap/boot-loader";
import { ConfigLoader } from "@/application/config/config-loader";
import router from "@/application/router";
import { initGlobalState } from "@/application/runtime/global-state";
import { initVisualTheme } from "@/visualization-core/hooks/use-visual-theme";
import "@/assets/deviceFonts/iconfont";

import "@/assets/font/index.css";
import "@/assets/deviceFonts/iconfont.css";
import "@/styles/global.css";
import "@/styles/flex.less";
import "@/styles/antdReset.less";
import "@/styles/visual-theme.less";
import "ant-design-vue/dist/reset.css";

export interface RenderProps {
  base?: string;
}

export class Application {
  #app?: App<Element>;

  public constructor(private readonly _props: RenderProps = {}) {}

  public async install(): Promise<void> {
    reportUe5BootProgress(80);
    const { default: RootApp } = await import("./app.tsx");
    const app = createApp(RootApp);
    const pinia = createPinia();
    setActivePinia(pinia);

    // 只注册一次 Pinia。createGlobalStateForVue 内部也会 createPinia()，重复注册会导致白屏。
    app.use(pinia);
    app.use(Antd);
    reportUe5BootProgress(86);

    await initGlobalState();
    licenseCheck();
    themeManager.mount();
    antd3LegacyThemeManager.mount();
    initVisualTheme();

    if (hasAuthSession()) {
      initAuthStore(getSessionAuth());
      try {
        reportUe5BootProgress(90);
        await ConfigLoader.loadConfig();
      } catch {
        // 未登录或配置缺失时不阻塞进入登录页
      }
    }

    app.use(router);
    await router.isReady();
    reportUe5BootProgress(96);
    app.mount("#Ue5");
    this.#app = app;
  }

  public uninstall(): void {
    this.#app?.unmount();
  }
}
