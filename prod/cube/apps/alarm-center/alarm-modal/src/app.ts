import { createApp, type App } from "vue";
import { createRouter, createWebHistory, type Router } from "vue-router";

import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { initCubePlayerAuth } from "@ghcloud/cube-player";
import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";

import { initAuthStore } from "./api/auth-store.ts";
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
    const env = (import.meta as unknown as { env: { MODE: string } }).env.MODE;
    let authInfo: CubeAuth = {
      token: "",
      tenant: "",
      terminal: CubeTerminalEnum.BUSINESS,
    };
    // 方便开发时自定义token
    if (env === "dev") {
      authInfo.token =
        "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRzIjpbIjU4MTk3MjYwIiwiNTk5OTYwNTIiLCIxODMyMTYwMiIsIjgyOTcwMTQwIiwiNjIyMjA4OTciLCI0NjI0MjcyOCIsIjQ3NTc4MTYxIiwiNjA1MTYyNjgiLCI1NTc2NDM1IiwiMzUzNzk4MjkiLCI3MjczNDIxMSIsIjQzOTUwMjQyIiwiOTI1MzQ0MDMiLCI1MTI1OTczNSIsIjk5MTc0MTEzIiwiNTY5NTA4OTYiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiYWRtaW4iOmZhbHNlLCJwYXNzd29yZF9mb3JjZWQiOnRydWUsImF1dGhvcml0aWVzIjpbIjE2NTE4NDY3OTE2OTM0MTQ0MDEiLCIxNzcyODMxNTkwODc2MDAwMjU4IiwiUk9MRV9BQ1RJVklUSV9VU0VSIiwiMTYwMjg0NzgyNjYzNzgyODA5NyIsIjE3NzY4NzA1ODQyMjgwNjUyODIiXSwiY2xpZW50X2lkIjoiY2xpZW50XzIiLCJwYXNzd29yZF9leHBpcmF0aW9uX3JlbWluZGVkIjpmYWxzZSwiYWRtaW5pc3RyYXRlZF90ZW5hbnRzIjpbIjU4MTk3MjYwIiwiNTk5OTYwNTIiLCIxODMyMTYwMiIsIjgyOTcwMTQwIiwiNjIyMjA4OTciLCI0NjI0MjcyOCIsIjQ3NTc4MTYxIiwiNjA1MTYyNjgiLCI1NTc2NDM1IiwiMzUzNzk4MjkiLCI3MjczNDIxMSIsIjQzOTUwMjQyIiwiOTI1MzQ0MDMiLCI1MTI1OTczNSIsIjk5MTc0MTEzIiwiNTY5NTA4OTYiXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLotoXnuqfnrqHnkIblkZgyIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9kYXRlIjoxNzcxNjU2NjIyMDAwLCJpZCI6MTQ3ODYzNjg4Njk4NDUyMzc3NywiZXhwIjoxODUxNTEwMjk2LCJqdGkiOiJmNWE3MTA3OC1mZmZkLTQ5YmEtYjAwOS1jNWZlOWEwN2RlMjgifQ.X9iSSL94kZlnwu92Dx2sOH4HlbJLzv4Pu3s7A7Q_gUIzzSQDyZZ9L5SbtARAfvhUmp5eoFbXgM7_2vy6EgLrsRhFvt3jCXVX7pG7lyXThhn1vNNXm1lXsOoOwGiNlunEGz8bD382VN_aUzrbKkuQiy_mFkb1kuNpgZZQWJUC6mr0mqSIS78--I1Dx-r7WxtmjVjkn6-fm9yvW-XcDbw_nV2BS6BXeCeZTDJsrnB7bzPZvZ-E3oiaC5HxGoyKSn4i12xGaUFbk248r3GVfvXFqUNHG6oDHLqLvwLJHHCrsstOtyd4nTX0JUsC4XOpv2Aap27rGuCBqXJC0v5GogEvAg";
      authInfo.tenant = "58197260";
    } else {
      authInfo = (await getAuthInfo()) as CubeAuth;
    }
    initAuthStore(authInfo);
    initCubePlayerAuth(authInfo);
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
  }

  private mount(app: App<Element>): void {
    app.mount("#cube-alarm-modal-root");
  }
}
