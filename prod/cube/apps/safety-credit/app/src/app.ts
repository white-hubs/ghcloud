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
    });
    app.use(router);
    app.config.globalProperties.mainRouter = this.props.router;
  }

  private mount(app: App<Element>): void {
    app.mount("#SafetyCreditApp");
  }
}
