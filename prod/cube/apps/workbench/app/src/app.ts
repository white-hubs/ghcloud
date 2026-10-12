import Antd from "ant-design-vue";
import { createApp, type App } from "vue";
import { createRouter, createWebHistory, type Router } from "vue-router";
import type { Store } from "vuex";

import { getAuthInfo } from "@ghcloud/cube-auth-utils";

import { initAuthStore } from "./api/auth-store.ts";
import { applicationIconMapKey, type ApplicationIconMap } from "./context/application-icons.ts";
import { routes } from "./router.ts";

type MenuConfig = { path: string; name: string; dataPermissions: { id: string }[] }[];

interface RenderProps {
  container?: Element | string;
  base?: string;
  store?: Store<unknown>;
  router?: Router;
  permissionConfig?: { menuConfig: MenuConfig; functionCodes: string[] };
  applicationIcons?: ApplicationIconMap | Promise<ApplicationIconMap>;
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
    const authInfo = await getAuthInfo();
    initAuthStore(authInfo);
    const { App: component } = await import("./app.tsx");
    const app = createApp(component);
    app.provide(applicationIconMapKey, Promise.resolve(this.props.applicationIcons ?? {}));
    app.use(Antd);
    this.props.store && app.use(this.props.store);
    this.installRouter(app);
    this.mount(app);
    this.#app = app;
  }

  public async uninstall(): Promise<void> {
    this.app.unmount();
  }

  private installRouter(app: App<Element>): void {
    const { base = "" } = this.props;
    const router = createRouter({
      history: createWebHistory(base),
      routes,
      scrollBehavior: () => ({ left: 0, top: 0 }),
    });
    app.use(router);
    app.config.globalProperties.mainRouter = this.props.router;
  }

  private mount(app: App<Element>): void {
    app.mount("#cube-workbench-app");
  }
}
