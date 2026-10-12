import { createApp, type App } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import { routes } from "./router";

interface RenderProps {
  container?: Element | string;
  base?: string;
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
    const mountTarget = "#safety-duty";
    if (this.props.container instanceof Element) {
      const containerMountTarget = this.props.container.querySelector(mountTarget);
      if (containerMountTarget) {
        app.mount(containerMountTarget);
        return;
      }
    }
    app.mount(mountTarget);
  }
}
