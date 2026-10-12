import { createPinia } from "pinia";
import { createApp, type App } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import { getEnvironment, setCustomHeaders } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";
import { authRequest, DEV_MOCK_AUTH } from "@ghcloud/cube-services-client/auth-request";

import { routes } from "./router/index.ts";

interface RenderProps {
  container?: Element | string;
  base?: string;
}

type DevAuthEnv = {
  VITE_DEV_AUTH_TOKEN?: string;
  VITE_DEV_AUTH_TENANT?: string;
};

const APP_BASE = "/apps/work-permit/h5";
const DEFAULT_DEV_AUTH_TENANT = "58197260";
const DEFAULT_DEV_AUTH_TOKEN =
  "Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIzNTM3OTgyOSIsIjcyNzM0MjExIiwiNDM5NTAyNDIiLCI5MjUzNDQwMyIsIjUxMjU5NzM1IiwiOTkxNzQxMTMiLCI1Njk1MDg5NiIsIjc2MTI1MTk4IiwiMTU0NDEyNzkiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMC4yNDM6MTAwODYiLCJhZG1pbiI6ZmFsc2UsInBhc3N3b3JkX2ZvcmNlZCI6dHJ1ZSwiYXVkIjoiY2xpZW50XzIiLCJwYXNzd29yZF9leHBpcmF0aW9uX3JlbWluZGVkIjpmYWxzZSwibmJmIjoxNzgyNzg5NzY0LCJhZG1pbmlzdHJhdGVkX3RlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIzNTM3OTgyOSIsIjcyNzM0MjExIiwiNDM5NTAyNDIiLCI5MjUzNDQwMyIsIjUxMjU5NzM1IiwiOTkxNzQxMTMiLCI1Njk1MDg5NiIsIjc2MTI1MTk4IiwiMTU0NDEyNzkiXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLotoXnuqfnrqHnkIblkZgzIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9kYXRlIjp7ImRhdGUiOnsieWVhciI6MjAyNiwibW9udGgiOjksImRheSI6MTd9LCJ0aW1lIjp7ImhvdXIiOjE2LCJtaW51dGUiOjU2LCJzZWNvbmQiOjI1LCJuYW5vIjowfX0sImlkIjoiMTQ3ODYzNjg4Njk4NDUyMzc3NyIsImV4cCI6MTg4Mjc4OTc2NCwiaWF0IjoxNzgyNzg5NzY0LCJqdGkiOiIwNDNiNTg2OS1mMjIwLTQwZjQtODBiYS0xOTJkY2ZhNTIyODMifQ.a8zsEmGpTEGUm98y9EjZSEK3KuOUfO8Ithl-w3gcTwi_C9MNx14bw335tIUUSHFjmvMKX_rx-g5ih2kR1narpRqOH7kGOC3-C_isRy8coMwI8EJdUnoVtNtl126bhwEsQfihV8QIouO-y9678ZTBAA9MDIeFZoLPZRmQQKnPvGHkq4gUFFqoV1qCu0IFLk0gYhMwaJ26U32BLEjde088vtVKXFn6BmSHgYNU4xvPZvy_AudJ_rvyo2cL-U04Bz6_36VKqTBQCNrr9RhOgVHzKwGbgJew6HQ_37mX7_aaE2lX2T87P_RbdY-LVr_y-lsfU_fYU509xZgk9uEKPSJ8ug";

const normalizeToken = (token: string): string => token.replace(/^Bearer\s+/i, "").trim();

const getQueryValue = (key: string): string => {
  return new URLSearchParams(window.location.search).get(key) ?? "";
};

const buildAuthInfo = (token: string, tenant: string, terminal = CubeTerminalEnum.APP): CubeAuth => {
  return {
    token: normalizeToken(token),
    tenant,
    terminal,
  };
};

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
    await this.handleAuthStore();
    this.setCurrentSession();
    const { App: component } = await import("./app.tsx");
    const app = createApp(component);
    this.installStore(app);
    this.installRouter(app);
    this.mount(app);
    this.#app = app;
  }

  private async handleAuthStore(): Promise<void> {
    const env = import.meta.env as DevAuthEnv & { MODE?: string };
    const runningEnvironment = getEnvironment();
    const token =
      getQueryValue("token") || sessionStorage.getItem("token") || sessionStorage.getItem("GH-token") || env.VITE_DEV_AUTH_TOKEN;
    const tenant =
      getQueryValue("tenant") || sessionStorage.getItem("tenant") || sessionStorage.getItem("GH-tenant") || env.VITE_DEV_AUTH_TENANT;

    if (token && tenant) {
      this.syncAuthInfo(buildAuthInfo(token, tenant));
      return;
    }

    if (env.MODE === "dev" && runningEnvironment !== "cubeApp") {
      this.syncAuthInfo(buildAuthInfo(DEFAULT_DEV_AUTH_TOKEN, DEFAULT_DEV_AUTH_TENANT));
      return;
    }

    const authInfo = (await getAuthInfo()) as CubeAuth;
    this.syncAuthInfo(authInfo);
  }

  private syncAuthInfo(authInfo: CubeAuth): void {
    const token = normalizeToken(authInfo.token ?? "");
    const tenant = `${authInfo.tenant ?? ""}`;
    const terminal = authInfo.terminal ?? CubeTerminalEnum.APP;

    if (!token || !tenant) {
      authRequest.updateAuth(DEV_MOCK_AUTH);
      return;
    }

    sessionStorage.setItem("token", token);
    sessionStorage.setItem("tenant", tenant);
    authRequest.updateAuth({
      ...DEV_MOCK_AUTH,
      token,
      tenant: Number(tenant) || DEV_MOCK_AUTH.tenant,
      terminal,
    });
    setCustomHeaders({
      Authorization: `Bearer ${token}`,
      tenant,
      terminal,
    });
  }

  private setCurrentSession(): void {
    const marketTenant = getQueryValue("marketTenant");
    const headTenant = getQueryValue("headTenant");

    if (marketTenant) {
      sessionStorage.setItem("marketTenant", marketTenant);
    }
    if (headTenant) {
      sessionStorage.setItem("headTenant", headTenant);
    }
  }

  private installStore(app: App<Element>): void {
    app.use(createPinia());
  }

  private installRouter(app: App<Element>): void {
    const router = createRouter({
      history: createWebHashHistory(this.props.base ?? APP_BASE),
      routes,
    });
    app.use(router);
  }

  private mount(app: App<Element>): void {
    app.mount("#app");
  }
}
