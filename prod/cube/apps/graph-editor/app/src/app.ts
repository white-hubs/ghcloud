import { authStore } from "./api/auth-store";
import { routes } from "./router";
import { message } from "@ghcloud/cube-ui";
import Antd from "ant-design-vue";
import { createPinia } from "pinia";
import { createApp, type App as VueApp } from "vue";
import { createRouter, createWebHistory, type Router } from "vue-router";

interface RenderProps {
  container?: Element | string;
  base?: string;
  router?: Router;
  permissionConfig?: {
    menuConfig: {
      path: string;
      name: string;
      dataPermissions: { id: string }[];
    }[];
    functionCodes: string[];
  };
}

export class Application {
  #app?: VueApp<Element>;

  private get app(): VueApp<Element> {
    if (!this.#app) {
      throw new Error("app not initialized!");
    }

    return this.#app;
  }

  public constructor(private readonly props: RenderProps) {}

  public async install(): Promise<void> {
    const { App: component } = await import("./App.tsx");
    const app = createApp(component);
    app.use(createPinia());
    app.use(Antd);
    this.installRouter(app);
    this.mount(app);
    this.#app = app;
  }

  public async uninstall(): Promise<void> {
    this.app.unmount();
  }

  private installRouter(app: VueApp<Element>): void {
    const { base = "", permissionConfig } = this.props;

    if (permissionConfig) {
      this.handleRouter(permissionConfig.menuConfig, base);
    }

    const router = createRouter({
      history: createWebHistory(base),
      routes,
    });

    router.beforeEach((to) => {
      if (to.meta.requiresAuth !== false && base && !authStore.token) {
        message.warning("鉴权信息不存在");
        return false;
      }

      return true;
    });

    app.use(router);
    app.config.globalProperties.mainRouter = this.props.router;
  }

  private handleRouter(
    menuConfigs: {
      path: string;
      name: string;
      dataPermissions: { id: string }[];
    }[],
    base: string,
  ): void {
    const microBase = base.endsWith("/") ? base.replace(/\/$/, "") : base;

    if (!microBase) {
      return;
    }

    const menusPath = menuConfigs.map((item) => item.path.replace(microBase, ""));

    routes.forEach((item) => {
      if (!menusPath.includes(item.path)) {
        return;
      }

      const pathIndex = menusPath.indexOf(item.path);
      const menuConfig = menuConfigs[pathIndex];
      const menuPermissions = menuConfig.dataPermissions[0];

      item.meta = {
        ...item.meta,
        permission: menuPermissions ? menuPermissions.id : "",
        title: menuConfig.name,
      };
    });
  }

  private mount(app: VueApp<Element>): void {
    const mountTarget = "#GraphEditorApp";

    if (this.props.container instanceof Element) {
      const containerMountTarget = this.props.container.querySelector("#GraphEditorApp");
      if (containerMountTarget) {
        app.mount(containerMountTarget);
        return;
      }
    }

    app.mount(mountTarget);
  }
}
