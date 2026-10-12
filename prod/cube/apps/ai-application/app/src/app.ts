import { createPinia } from "pinia";
import { createApp, type App as VueApp } from "vue";
import { createRouter, createWebHistory, type Router } from "vue-router";

import { routes } from "./router";

type MenuConfig = { path: string; name: string; dataPermissions: { id: string }[] }[];

interface RenderProps {
  container?: Element | string;
  base?: string;
  router?: Router;
  permissionConfig?: { menuConfig: MenuConfig; functionCodes: string[] };
}

export class Application {
  #app?: VueApp<Element>;

  private get app(): VueApp<Element> {
    if (!this.#app) {
      throw new Error("app not initialized");
    }
    return this.#app;
  }

  public constructor(private readonly props: RenderProps) {}

  public async install(): Promise<void> {
    const { App: component } = await import("./app.tsx");
    const app = createApp(component);
    this.installRouter(app);
    app.use(createPinia());
    this.mount(app);
    this.#app = app;
  }

  public uninstall(): void {
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
    app.use(router);
    app.config.globalProperties.mainRouter = this.props.router;
  }

  private handleRouter(menuConfigs: MenuConfig, base: string): void {
    const microBase = base.slice(0, base.length - 1);
    const menusPath = menuConfigs.map((item) => {
      return item.path.replace(microBase, "");
    });
    routes.forEach((item) => {
      if (menusPath.includes(item.path)) {
        const pathIndex = menusPath.indexOf(item.path);
        const menuConfig = menuConfigs[pathIndex];
        const menuPermissions = menuConfig.dataPermissions[0];
        item.meta = {
          ...item.meta,
          permission: menuPermissions ? menuPermissions.id : "",
          title: menuConfig.name,
        };
      }
    });
  }

  private mount(app: VueApp<Element>): void {
    app.mount("#AiApplicationApp");
  }
}
