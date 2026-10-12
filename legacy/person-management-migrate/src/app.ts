import Antd from "ant-design-vue";
import moment from "moment";
import { createApp, type App as VueApp } from "vue";
import { createRouter, createWebHistory, type Router } from "vue-router";

import App from "./App.vue";
import { constantRoutes } from "./router";
import "moment/locale/zh-cn";

import "./style/common.less";

moment.locale("zh-cn");

declare const __CONTAINER_ID__: string;

interface RenderProps {
  container?: Element | string;
  base?: string;
  router?: unknown;
  permissionConfig?: { menuConfig?: unknown[] };
  onGlobalStateChange?: (...args: unknown[]) => void;
  setGlobalState?: (...args: unknown[]) => void;
}

export class Application {
  #app?: VueApp;

  private get app(): VueApp {
    if (!this.#app) {
      throw new Error("app not initialized!");
    }
    return this.#app;
  }

  public constructor(private readonly props: RenderProps) {
    this.handleRouter((props.permissionConfig?.menuConfig as any[]) ?? [], this.normalizeBase(props.base));
  }

  public async install(): Promise<void> {
    const app = createApp(App);
    const router = this.createRouter();
    app.use(router);
    app.use(Antd);
    app.config.globalProperties.mainRouter = this.props.router;

    app.config.errorHandler = (err) => {
      if (err instanceof Error && err.message.includes("sessionStorage")) {
        return;
      }
    };

    if (this.props.onGlobalStateChange) {
      app.config.globalProperties.$onGlobalStateChange = this.props.onGlobalStateChange;
    }
    if (this.props.setGlobalState) {
      app.config.globalProperties.$setGlobalState = this.props.setGlobalState;
    }

    this.mount(app);
    this.#app = app;
  }

  public async uninstall(): Promise<void> {
    this.app.unmount();
  }

  private normalizeBase(base?: string): string {
    if (!base) {
      return "/portal/personalManagement/";
    }
    return base.endsWith("/") ? base : `${base}/`;
  }

  private createRouter(): Router {
    const { base = "/portal/personalManagement/" } = this.props;
    return createRouter({
      history: createWebHistory(this.normalizeBase(base)),
      routes: constantRoutes,
    });
  }

  private mount(app: VueApp): void {
    // qiankun 传入的 container 内含 qiankun-head，直接 mount 会覆盖样式头；与 legacy 子应用一致用根 id 挂载
    app.mount(__CONTAINER_ID__);
  }

  private handleRouter(menuConfigs: any[], base: string): void {
    const microBase = base.endsWith("/") ? base.slice(0, base.length - 1) : base;
    const menusPath = menuConfigs.map((item) => item.path.replace(microBase, ""));
    constantRoutes.forEach((item: any) => {
      if (!menusPath.includes(item.path)) {
        return;
      }
      const pathIndex = menusPath.indexOf(item.path);
      const menuConfig = menuConfigs[pathIndex];
      const menuPermissions = menuConfig.dataPermissions?.[0];
      item.meta = {
        ...item.meta,
        permission: menuPermissions ? menuPermissions.id : "",
        title: menuConfig.name,
      };
    });
  }
}
