import { createApp, type App } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { installH5AuthGuard } from "@ghcloud/cube-h5-auth";
import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";

import { routes } from "./router";
import { authStore, clearAuthStore, syncAuthStore } from "./stores/auth";
import { getUrlParams } from "./utils/url";

interface RenderProps {
  container?: Element | string;
  base?: string;
}

const normalizeToken = (token?: string): string =>
  String(token ?? "")
    .replace(/^Bearer\s+/i, "")
    .trim();

const decodeRedirect = (value: string): string => {
  let result = value;
  for (let index = 0; index < 2; index += 1) {
    try {
      const decoded = decodeURIComponent(result);
      if (decoded === result) {
        return decoded;
      }
      result = decoded;
    } catch {
      return result;
    }
  }
  return result;
};

const replaceLoginHashWhenAuthenticated = (defaultPath: string): void => {
  const rawHash = window.location.hash.replace(/^#/, "");
  const [path = "", query = ""] = rawHash.split("?");
  if (path !== "/auth/login") {
    return;
  }
  const redirect = new URLSearchParams(query).get("redirect");
  window.location.hash = redirect ? decodeRedirect(redirect) : defaultPath;
};

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
    const runningEnvironment = getEnvironment();
    let authInfo: CubeAuth = {
      token: "",
      tenant: "",
      terminal: CubeTerminalEnum.APP,
    };

    if (env === "dev" && runningEnvironment !== "cubeApp") {
      authInfo = {
        token:
          "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIzNTM3OTgyOSIsIjcyNzM0MjExIiwiNDM5NTAyNDIiLCI5MjUzNDQwMyIsIjUxMjU5NzM1IiwiOTkxNzQxMTMiLCI1Njk1MDg5NiIsIjc2MTI1MTk4IiwiMTU0NDEyNzkiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMC4yNDM6MTAwODYiLCJhZG1pbiI6ZmFsc2UsInBhc3N3b3JkX2ZvcmNlZCI6dHJ1ZSwiYXVkIjoiY2xpZW50XzIiLCJwYXNzd29yZF9leHBpcmF0aW9uX3JlbWluZGVkIjpmYWxzZSwibmJmIjoxNzgyOTU1MTM4LCJhZG1pbmlzdHJhdGVkX3RlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIzNTM3OTgyOSIsIjcyNzM0MjExIiwiNDM5NTAyNDIiLCI5MjUzNDQwMyIsIjUxMjU5NzM1IiwiOTkxNzQxMTMiLCI1Njk1MDg5NiIsIjc2MTI1MTk4IiwiMTU0NDEyNzkiXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLotoXnuqfnrqHnkIblkZgzIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9kYXRlIjp7ImRhdGUiOnsieWVhciI6MjAyNiwibW9udGgiOjksImRheSI6MTd9LCJ0aW1lIjp7ImhvdXIiOjE2LCJtaW51dGUiOjU2LCJzZWNvbmQiOjI1LCJuYW5vIjowfX0sImlkIjoiMTQ3ODYzNjg4Njk4NDUyMzc3NyIsImV4cCI6MTg4Mjk1NTEzOCwiaWF0IjoxNzgyOTU1MTM4LCJqdGkiOiJhMDQxY2RhNy1jYWJjLTRjMDctYjM1Ni03OGFmN2FhZTgxODcifQ.cgDaSu83LtaaqcNvZp6_NsaIlDFQaAAk-mhlxSeAQp9EkhRt5tyawgDrlj2WqxXqtmywC6Urm8TU350BZcMOIye6XtMkrGOf45b3BPWkkj8IZ4bYBNe4eWsSuFpByIhepc_UIXnFOYiT1FCuNmSxUoqvTeDgqEBrZ2SZQhxLyzrqpX6wiugFJ3J3jwCj81B-SqA9gvGi_1nkxGvTRPymClzG0bP-rfYfc421c0iqFMtOpRxJMzwIJkD_4jMkMlxk-edqUGkJtl5mAn1jHoXetMSGypVILv12dL1-aPw69SWQXnUzQv2ifBd04KZkzGDfufc_Mm-XgBhen11fQ3zwsg",
        tenant: "58197260",
        terminal: CubeTerminalEnum.APP,
      };
    } else {
      authInfo = (await getAuthInfo()) as CubeAuth;
    }

    const normalizedAuth = {
      token: normalizeToken(authInfo.token),
      tenant: authInfo.tenant,
      terminal: CubeTerminalEnum.APP,
    };
    syncAuthStore(normalizedAuth);
    if (normalizedAuth.token) {
      replaceLoginHashWhenAuthenticated("/entry");
    }
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
      history: createWebHashHistory(this.props.base ?? "/apps/cold-storage/h5"),
      routes,
    });

    installH5AuthGuard(router, {
      loginPath: "/auth/login",
      defaultRedirectPath: "/entry",
      showGuestEnter: false,
      getToken: () => authStore.token,
      isInApp: () => getEnvironment() === "cubeApp",
      onAuthChanged: (authInfo) => {
        syncAuthStore({
          token: normalizeToken(authInfo.token),
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
