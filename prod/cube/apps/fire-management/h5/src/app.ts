import { createApp, type App } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { installH5AuthGuard } from "@ghcloud/cube-h5-auth";
import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";

import { routes } from "./router";
import { authStore, clearAuthStore, syncAuthStore } from "./stores/auth";
import { getUrlParams } from "./utils";

interface RenderProps {
  container?: Element | string;
  base?: string;
}

export class Application {
  public constructor(private readonly props: RenderProps) {}

  public async install(): Promise<void> {
    await this.handleAuthStore();
    this.setCurrentSession();
    const { App: component } = await import("./app.tsx");
    const app = createApp(component);
    this.installRouter(app);
    this.mount(app);
  }

  private async handleAuthStore(): Promise<void> {
    const env = (import.meta as unknown as { env: { MODE: string } }).env.MODE;
    const runingEnvironment = getEnvironment();
    let authInfo = {
      token: "",
      tenant: "",
      terminal: CubeTerminalEnum.APP,
    };
    // 方便开发时自定义token
    if (env === "dev" && runingEnvironment !== "cubeApp") {
      authInfo.token =
        "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIzNTM3OTgyOSIsIjcyNzM0MjExIiwiNDM5NTAyNDIiLCI5MjUzNDQwMyIsIjUxMjU5NzM1IiwiOTkxNzQxMTMiLCI1Njk1MDg5NiIsIjc2MTI1MTk4IiwiMTU0NDEyNzkiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMC4yNDM6MTAwODYiLCJhZG1pbiI6ZmFsc2UsInBhc3N3b3JkX2ZvcmNlZCI6dHJ1ZSwiYXVkIjoiY2xpZW50XzIiLCJwYXNzd29yZF9leHBpcmF0aW9uX3JlbWluZGVkIjpmYWxzZSwibmJmIjoxNzgyNDQzNzQ3LCJhZG1pbmlzdHJhdGVkX3RlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIzNTM3OTgyOSIsIjcyNzM0MjExIiwiNDM5NTAyNDIiLCI5MjUzNDQwMyIsIjUxMjU5NzM1IiwiOTkxNzQxMTMiLCI1Njk1MDg5NiIsIjc2MTI1MTk4IiwiMTU0NDEyNzkiXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLotoXnuqfnrqHnkIblkZgzIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9kYXRlIjp7ImRhdGUiOnsieWVhciI6MjAyNiwibW9udGgiOjksImRheSI6MTd9LCJ0aW1lIjp7ImhvdXIiOjE2LCJtaW51dGUiOjU2LCJzZWNvbmQiOjI1LCJuYW5vIjowfX0sImlkIjoiMTQ3ODYzNjg4Njk4NDUyMzc3NyIsImV4cCI6MTg4MjQ0Mzc0NywiaWF0IjoxNzgyNDQzNzQ3LCJqdGkiOiJiYjY0MTU0OC1iMWM0LTQ0ZTktYjc3NS1jMmYzYjY5NGFkMDcifQ.jkHwKOuJioeMAnAtn9_43B2JBh3VMNjqZnLKVEob6jY2lpGrtAs4CVGxgVzmcossG1LsU6JlKvGgCaQT6jbcukgAU2QwqvLM4vvp6USqf4wbk41N9l0VQJmYg5H55LDHaH3bhTFf9W3c4ZKbHPA1DAAded9klFAnxHLkjUoOcvtO5YnYo5zO2VUMJFiasLwS0tHdzPeYTe76C-Mn0iY7-nQHxq5ys5Lv7VlkEDhVv-E_N80wVK1FSPbyYmz0S9AbxyX3N4wKtIbXfG5gH7b1Tiip1CGrPtf4MWm-NQphilLkQqNGlkcScy7U7xMUH8OT-S4J01C0V4KB8JmDsZ_ImA";
      authInfo.tenant = "58197260";
    } else {
      authInfo = (await getAuthInfo()) as CubeAuth;
    }
    authInfo.token = authInfo.token.includes("Bearer") ? authInfo.token.split(" ")[1] : authInfo.token;
    syncAuthStore({
      token: authInfo.token,
      tenant: authInfo.tenant,
      terminal: CubeTerminalEnum.APP,
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
    } else {
      sessionStorage.removeItem("isApp");
    }
  }

  private installRouter(app: App<Element>): void {
    const router = createRouter({
      history: createWebHashHistory(this.props.base ?? "/apps/fire-management/h5"),
      routes,
    });
    installH5AuthGuard(router, {
      loginPath: "/auth/login",
      defaultRedirectPath: "/fire-point-statistics",
      showGuestEnter: false,
      getToken: () => authStore.token,
      isInApp: () => getEnvironment() === "cubeApp",
      onAuthChanged: (authInfo) => {
        syncAuthStore({
          token: authInfo.token,
          tenant: authInfo.tenant,
          terminal: CubeTerminalEnum.APP,
        });
      },
      onAuthCleared: () => {
        clearAuthStore();
      },
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
