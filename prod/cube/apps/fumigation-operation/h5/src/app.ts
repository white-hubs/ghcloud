import { createApp, type App } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import { initAuthStore as initAlarmCenterAuth } from "@ghcloud/cube-alarm-center-h5/src/api/auth-store.ts";
import { initAuthStore as initGenericComponentAuth } from "@ghcloud/cube-app-generic-component";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { initCubePlayerAuth } from "@ghcloud/cube-player";
import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";
import { authRequest, DEV_MOCK_AUTH } from "@ghcloud/cube-services-client/auth-request";

import { initAuthStore } from "./api/auth-store.ts";
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
    let authInfo: CubeAuth;

    if (mode === "dev" && getEnvironment() !== "cubeApp") {
      authRequest.updateAuth(DEV_MOCK_AUTH);
      authInfo = {
        token: DEV_MOCK_AUTH.token,
        tenant: String(DEV_MOCK_AUTH.tenant),
        terminal: DEV_MOCK_AUTH.terminal ?? CubeTerminalEnum.APP,
      };
    } else {
      authInfo = (await getAuthInfo()) as CubeAuth;
      authRequest.updateAuth({
        token: normalizeToken(authInfo.token),
        tenant: Number(authInfo.tenant || 0),
        terminal: CubeTerminalEnum.APP,
      });
    }

    initAuthStore(authInfo);
    initGenericComponentAuth(authInfo);
    initAlarmCenterAuth(authInfo);
    initCubePlayerAuth(authInfo);
  }

  private installRouter(app: App<Element>): void {
    const router = createRouter({
      history: createWebHashHistory(this.props.base ?? import.meta.env.BASE_URL),
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
