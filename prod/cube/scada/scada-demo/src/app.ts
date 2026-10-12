import { createPinia } from "pinia";
import { createApp, type App as VueApp } from "vue";
import { createRouter, createWebHistory, type Router } from "vue-router";

import { routes } from "./router";

import "ant-design-vue/dist/reset.css";

interface RenderProps {
  container?: Element | string;
  base?: string;
  router?: Router;
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
    const { App: component } = await import("./app.tsx");
    const app = createApp(component);
    app.use(createPinia());
    this.installRouter(app);
    this.mount(app);
    this.#app = app;
  }

  public async uninstall(): Promise<void> {
    this.app.unmount();
  }

  private installRouter(app: VueApp<Element>): void {
    const { base = "" } = this.props;
    const router = createRouter({
      history: createWebHistory(base),
      routes,
    });
    app.use(router);
    app.config.globalProperties.mainRouter = this.props.router;
  }

  private mount(app: VueApp<Element>): void {
    const mountTarget = "#ScadaDemoApp";
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
