import Antd from "ant-design-vue";
import { createPinia } from "pinia";
import { createApp, type App as VueApp } from "vue";
import { type Router } from "vue-router";

import { createStudioRouter } from "./router";
import { setupElements } from "./setup";

import "ant-design-vue/dist/reset.css";
import "./style.css";

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
    await setupElements();
    const { App: component } = await import("./app");
    const app = createApp(component);
    app.use(createPinia());
    app.use(Antd);
    this.installRouter(app);
    this.mount(app);
    this.#app = app;
  }

  public async uninstall(): Promise<void> {
    this.app.unmount();
    this.#app = undefined;
  }

  private installRouter(app: VueApp<Element>): void {
    const { base = "" } = this.props;
    const router = createStudioRouter(base);
    app.use(router);
    app.config.globalProperties.mainRouter = this.props.router;
  }

  private mount(app: VueApp<Element>): void {
    const mountTarget = "#ScadaStudioApp";
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
