import { createApp, type App } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import { initAuthStore as initGenericComponentAuth } from "@ghcloud/cube-app-generic-component";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { installH5AuthGuard } from "@ghcloud/cube-h5-auth";
import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";

import { authStore, initAuthStore } from "./api/auth-store";
import { routes } from "./router";
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
        "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIzNTM3OTgyOSIsIjcyNzM0MjExIiwiNDM5NTAyNDIiLCI5MjUzNDQwMyIsIjUxMjU5NzM1IiwiOTkxNzQxMTMiLCI1Njk1MDg5NiIsIjc2MTI1MTk4IiwiMTU0NDEyNzkiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMC4yNDM6MTAwODYiLCJhZG1pbiI6ZmFsc2UsInBhc3N3b3JkX2ZvcmNlZCI6dHJ1ZSwiYXVkIjoiY2xpZW50XzIiLCJwYXNzd29yZF9leHBpcmF0aW9uX3JlbWluZGVkIjpmYWxzZSwibmJmIjoxNzgwMDQ0MTI2LCJhZG1pbmlzdHJhdGVkX3RlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIzNTM3OTgyOSIsIjcyNzM0MjExIiwiNDM5NTAyNDIiLCI5MjUzNDQwMyIsIjUxMjU5NzM1IiwiOTkxNzQxMTMiLCI1Njk1MDg5NiIsIjc2MTI1MTk4IiwiMTU0NDEyNzkiXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLotoXnuqfnrqHnkIblkZgzIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9kYXRlIjp7ImRhdGUiOnsieWVhciI6MjAyNiwibW9udGgiOjksImRheSI6MTd9LCJ0aW1lIjp7ImhvdXIiOjE2LCJtaW51dGUiOjU2LCJzZWNvbmQiOjI1LCJuYW5vIjowfX0sImlkIjoiMTQ3ODYzNjg4Njk4NDUyMzc3NyIsImV4cCI6MTg4MDA0NDEyNiwiaWF0IjoxNzgwMDQ0MTI2LCJqdGkiOiI1NmI1Njg0MC04ZWM2LTQ3ZjYtYTRlOS02ODFlZWVjYmVhNGMifQ.MTGRXmm2r_DxPCXY9YuY7CDLjDQddzm3vHrU56lr-JkAO9GZonTrL421r5nxdvdrmKofdPcR0y0vzvP9UQrpivV1YN_vj10d0AOQ5lKe4W6KoAcWtXnjd17c41iOS9V0JRs3C0nF02COfDcvz8OeaBdKBfVQeVOz69tJnEzKBtTMAD8M8H4_cae7T4hZjZqPZ4LuMK7RvV98PGwqh9zPuaa7CPtto7asRxMPvbuatcY49WWPpta_b-WC3Gt9Mc0-rwS_9riHZA7YSIgh8HGpQ8M2ajTSUp8rhAEi_Hn6LxsFMFST5R4meznkSnUK0_RvHw4sD9BFlwTUS6Krhl-cEw";
      authInfo.tenant = "58197260";
    } else {
      authInfo = (await getAuthInfo()) as CubeAuth;
    }
    authInfo.token = authInfo.token.includes("Bearer") ? authInfo.token.split(" ")[1] : authInfo.token;
    initAuthStore({
      token: authInfo.token,
      tenant: authInfo.tenant,
      terminal: CubeTerminalEnum.APP,
    });
    initGenericComponentAuth(authStore);
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
      history: createWebHashHistory(this.props.base ?? "/apps/granary-management/h5"),
      routes,
    });
    installH5AuthGuard(router, {
      loginPath: "/auth/login",
      defaultRedirectPath: "/grain-monitor-detail",
      getToken: () => authStore.token,
      isInApp: () => getEnvironment() === "cubeApp",
      onAuthChanged: (authInfo) => {
        initAuthStore({
          token: authInfo.token,
          tenant: authInfo.tenant,
          terminal: CubeTerminalEnum.APP,
        });
        initGenericComponentAuth(authStore);
      },
      onAuthCleared: () => {
        initAuthStore({ token: "", tenant: "", terminal: authStore.terminal });
        initGenericComponentAuth(authStore);
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
