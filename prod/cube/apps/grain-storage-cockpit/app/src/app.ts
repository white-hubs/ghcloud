import { createApp, type App } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import { routes } from "@/router";

export interface RenderProps {
  container?: Element | string;
  base?: string;
}

export class Application {
  #app: App<Element> | undefined;

  public constructor(private readonly props: RenderProps) {}

  public async install(): Promise<void> {
    const { App: RootApp } = await import("./app.tsx");
    const app = createApp(RootApp);
    const router = createRouter({
      history: createMemoryHistory(this.props.base ?? ""),
      routes,
    });
    app.use(router);
    app.mount("#GrainStorageCockpitApp");
    this.#app = app;
  }

  public uninstall(): void {
    this.#app?.unmount();
    this.#app = undefined;
  }
}
