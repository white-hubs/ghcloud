import { createPinia } from "pinia";
import { createApp, type App } from "vue";
import { createRouter, createWebHistory, type Router } from "vue-router";

import { i18n } from "@/locales";
import { routes } from "@/router";

type MenuConfig = { path: string; name: string; dataPermissions: { id: string }[] }[];

export interface RenderProps {
  container?: Element | string;
  /** 子应用基础路径，qiankun 模式下由主应用透传；独立运行默认 `/`。 */
  base?: string;
  /** 主应用的 router 实例（可选，供跨子应用导航使用） */
  router?: Router;
  /** 主应用透传的权限/菜单配置，用于回写路由 meta */
  permissionConfig?: { menuConfig: MenuConfig; functionCodes: string[] };
}

export class Application {
  #app?: App<Element>;

  private get app(): App<Element> {
    if (!this.#app) {
      throw new Error("app not initialized!");
    }
    return this.#app;
  }

  public constructor(private readonly props: RenderProps) {}

  public async install(): Promise<void> {
    const { App: component } = await import("./app.tsx");
    const app = createApp(component);
    app.use(i18n);
    this.installRouter(app);
    this.installPinia(app);
    this.mount(app);
    this.#app = app;
  }

  public uninstall(): void {
    this.app.unmount();
  }

  private installRouter(app: App<Element>): void {
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

  /**
   * 按主应用下发的菜单配置，把菜单名/权限 ID 回写到当前路由的 meta 上。
   * 若主应用未透传 permissionConfig，则使用路由自身静态 meta 即可。
   */
  private handleRouter(menuConfigs: MenuConfig, base: string): void {
    const microBase = base.replace(/\/$/, "");
    const menusPath = menuConfigs.map((item) => item.path.replace(microBase, ""));
    routes.forEach((item) => {
      if (!item.path || !menusPath.includes(item.path)) {
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

  private installPinia(app: App<Element>): void {
    app.use(createPinia());
  }

  private mount(app: App<Element>): void {
    // qiankun 透传的 props.container 外层包含 qiankun-head，直接渲染会覆盖 head 中的样式注入。
    // 因此此处按 id 绑定容器。如重命名 id，需同时改动 index.html 与 vite.config.ts#scope-selector。
    const container = typeof this.props.container === "string" ? document.querySelector(this.props.container) : this.props.container;
    const target = container?.querySelector("#PersonnelPositioning") ?? document.querySelector("#PersonnelPositioning");
    if (!target) throw new Error("PersonnelPositioning mount target is missing");
    app.mount(target);
  }
}
