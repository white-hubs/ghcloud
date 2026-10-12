import Antd from "ant-design-vue";
import { createApp, type App } from "vue";
import { createRouter, createMemoryHistory } from "vue-router";

import type { CubeAuth } from "@ghcloud/cube-protocol";

import { routes } from "./router";
import { authGuard } from "./router/guard";

import "ant-design-vue/dist/reset.css";
import "./styles/antd-overrides.less";

interface RenderProps {
  container?: Element | string;
  base?: string;
  auth: CubeAuth;
}

export class Application {
  #app?: App<Element>;

  public constructor(private readonly props: RenderProps) {}

  public async install(): Promise<void> {
    const { App: RootApp } = await import("./app.tsx");
    const app = createApp(RootApp);
    const router = createRouter({
      history: createMemoryHistory(this.props.base || ""),
      routes,
    });
    authGuard(router);
    app.use(router);
    app.use(Antd);
    app.mount("#InspectionCommandScreenApp");
    this.#app = app;
  }

  public async uninstall(): Promise<void> {
    this.#app?.unmount();
  }
}
