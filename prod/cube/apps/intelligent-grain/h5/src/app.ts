import { createApp, type App } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";
import { authRequest, DEV_MOCK_AUTH } from "@ghcloud/cube-services-client/auth-request";

import { routes } from "./router";

interface RenderProps {
  container?: Element | string;
  base?: string;
}

function normalizeToken(token: string): string {
  return token.includes("Bearer") ? (token.split(" ")[1] ?? token) : token;
}

export class Application {
  public constructor(private readonly props: RenderProps) {}

  public async install(): Promise<void> {
    await this.installAuthContext();
    const { App: component } = await import("./app.tsx");
    const app = createApp(component);
    this.installRouter(app);
    this.mount(app);
  }

  private async installAuthContext(): Promise<void> {
    const mode = import.meta.env.MODE;
    if (mode === "dev" && getEnvironment() !== "cubeApp") {
      authRequest.updateAuth(DEV_MOCK_AUTH);
      return;
    }

    const authInfo = (await getAuthInfo()) as CubeAuth;
    authRequest.updateAuth({
      token: normalizeToken(authInfo.token),
      tenant: Number(authInfo.tenant || 0),
      terminal: CubeTerminalEnum.APP,
    });
  }

  private installRouter(app: App<Element>): void {
    const router = createRouter({
      history: createWebHashHistory(this.props.base ?? "/apps/intelligent-grain/h5"),
      routes,
    });
    app.use(router);
  }

  private mount(app: App<Element>): void {
    const container = this.props.container;
    if (container instanceof Element) {
      app.mount(container);
      return;
    }
    app.mount(container ?? "#app");
  }
}
