import { createApp, type App } from "vue";
import { createRouter, createWebHistory, type Router } from "vue-router";

import { routes } from "./router";

interface RenderProps {
  container?: Element | string;
  base?: string;
  router?: Router;
}

export class Application {
  #app?: App<Element>;

  public constructor(private readonly props: RenderProps) {}

  public async install(): Promise<void> {
    const { App: component } = await import("./app.tsx");
    const app = createApp(component);
    const router = createRouter({
      history: createWebHistory(this.props.base ?? ""),
      routes,
    });
    app.use(router);
    this.mount(app);
    this.#app = app;
  }

  public async uninstall(): Promise<void> {
    this.#app?.unmount();
  }

  private mount(app: App<Element>): void {
    app.mount("#cube-warehouse-safety-app");
  }
}
