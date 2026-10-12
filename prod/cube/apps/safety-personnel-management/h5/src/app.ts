import { createApp, type App as VueApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import { initAuthStore as initGenericAuthStore } from "@ghcloud/cube-app-generic-component";
import { getEnvironment, setCustomHeaders } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { type CubeAuth, CubeTerminalEnum } from "@ghcloud/cube-protocol";

import { initAuthStore } from "./api/auth-store";
import { authRequest } from "./hooks/use-auth-request";
import { routes } from "./router";
import { getUrlParams } from "./utils";

interface RenderProps {
  container?: Element | string;
  base?: string;
}

export class Application {
  #app?: VueApp<Element>;

  public constructor(private readonly props: RenderProps) {}

  private get app(): VueApp<Element> {
    if (!this.#app) {
      throw new Error("app not initialized!");
    }
    return this.#app;
  }

  public async install(): Promise<void> {
    await this.handleAuthStore();
    this.setCurrentSession();
    const { App } = await import("./app.tsx");
    const app = createApp(App);
    this.installRouter(app);
    this.mount(app);
    this.#app = app;
  }

  public async uninstall(): Promise<void> {
    this.app.unmount();
  }

  private async handleAuthStore(): Promise<void> {
    const authInfo = (await getAuthInfo()) as CubeAuth;
    authInfo.token = authInfo.token.includes("Bearer") ? authInfo.token.split(" ")[1] : authInfo.token;
    authInfo.terminal = authInfo.terminal ?? CubeTerminalEnum.APP;
    initAuthStore(authInfo);
    initGenericAuthStore(authInfo);
    authRequest.updateAuth({
      tenant: Number(authInfo.tenant) || 0,
      terminal: authInfo.terminal,
      token: authInfo.token,
    });
    setCustomHeaders({
      Authorization: authInfo.token.includes("Bearer") ? authInfo.token : `Bearer ${authInfo.token}`,
      tenant: authInfo.tenant,
      terminal: authInfo.terminal,
    });
  }

  private setCurrentSession(): void {
    const urlParams = getUrlParams();
    if (urlParams.marketTenant !== undefined) {
      sessionStorage.setItem("marketTenant", urlParams.marketTenant);
    }
    if (urlParams.headTenant !== undefined) {
      sessionStorage.setItem("headTenant", urlParams.headTenant);
    }
    if (getEnvironment() === "cubeApp") {
      sessionStorage.setItem("isApp", "1");
      return;
    }
    sessionStorage.removeItem("isApp");
  }

  private installRouter(app: VueApp<Element>): void {
    const base = this.props.base ?? "/apps/safety-personnel-management/h5";
    const router = createRouter({
      history: createWebHashHistory(base),
      routes,
    });
    (window as Window & { __CUBE_H5_VUE_ROUTER__?: unknown }).__CUBE_H5_VUE_ROUTER__ = router;
    app.use(router);
  }

  private mount(app: VueApp<Element>): void {
    const container = this.props.container;
    if (container instanceof Element) {
      app.mount(container);
      return;
    }
    app.mount(container ?? "#app");
  }
}
