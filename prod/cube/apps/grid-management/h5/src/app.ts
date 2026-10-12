import { initAuthStore } from "./api/auth-store.ts";
import { routes } from "./router/index.ts";
import { initAuthStore as streamInitAuthStore } from "@ghcloud-legacy/streamengine-h5-migrate/src/service/auth-store.ts";
import { initAuthStore as initAlarmCenterAuthStore } from "@ghcloud/cube-alarm-center-h5/src/api/auth-store.ts";
import { initAuthStore as genericAuthStore } from "@ghcloud/cube-app-generic-component";
import { getEnvironment, setCustomHeaders } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import { initAuthStore as initAssetManagementAuthStore } from "@ghcloud/cube-asset-management-h5/src/api/auth-store.ts";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { initAuthStore as initDailyTaskAuthStore } from "@ghcloud/cube-daily-task-h5/src/api/auth-store.ts";
import { initAuthStore as initAppDesignAuthStore } from "@ghcloud/cube-h5-design/src/api/auth-store.ts";
import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";
import { initAuthStore as initTodoCenterAuthStore } from "@ghcloud/cube-todo-center-h5/src/api/auth-store.ts";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createApp, type App } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

interface RenderProps {
  container?: Element | string;
  base?: string;
}

const getUrlParams = (): Record<string, string> => {
  const locationHref = window.location.href;
  const str = locationHref.split("?")[1];
  if (!str) {
    return {};
  }
  const params = str.split("&");
  const handleParams: Record<string, string> = {};
  for (let i = 0; i < params.length; i++) {
    const g = params[i].split("=");
    handleParams[g[0]] = g[1];
  }
  return handleParams;
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
    // 处理鉴权信息
    await this.handleAuthStore();
    this.setCurrentSesstion();
    const { App: component } = await import("./app.tsx");
    const app = createApp(component);
    this.installStore(app);
    this.installRouter(app);
    this.mount(app);
    this.#app = app;
  }

  private async handleAuthStore(): Promise<void> {
    const env = (import.meta as unknown as { env: { MODE: string } }).env.MODE;
    let authInfo = {
      token: "",
      tenant: "",
      terminal: CubeTerminalEnum.APP,
    };

    // 方便开发时自定义token 正式上线前替换
    if (env === "dev") {
      authInfo.token = "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIxNzgzNTMxNCIsIjM1Mzc5ODI5IiwiNzI3MzQyMTEiLCI0Mzk1MDI0MiIsIjkyNTM0NDAzIiwiNTEyNTk3MzUiLCI5OTE3NDExMyIsIjU2OTUwODk2IiwiNzYxMjUxOTgiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMC4yNDM6MTAwODYiLCJhZG1pbiI6ZmFsc2UsInBhc3N3b3JkX2ZvcmNlZCI6dHJ1ZSwiYXVkIjoiY2xpZW50XzIiLCJwYXNzd29yZF9leHBpcmF0aW9uX3JlbWluZGVkIjpmYWxzZSwibmJmIjoxNzczMTE0MDc3LCJhZG1pbmlzdHJhdGVkX3RlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIxNzgzNTMxNCIsIjM1Mzc5ODI5IiwiNzI3MzQyMTEiLCI0Mzk1MDI0MiIsIjkyNTM0NDAzIiwiNTEyNTk3MzUiLCI5OTE3NDExMyIsIjU2OTUwODk2IiwiNzYxMjUxOTgiXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLotoXnuqfnrqHnkIblkZgzIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9kYXRlIjp7ImRhdGUiOnsieWVhciI6MjAyNiwibW9udGgiOjksImRheSI6MTd9LCJ0aW1lIjp7ImhvdXIiOjE2LCJtaW51dGUiOjU2LCJzZWNvbmQiOjI1LCJuYW5vIjowfX0sImlkIjoiMTQ3ODYzNjg4Njk4NDUyMzc3NyIsImV4cCI6MTg3MzExNDA3NywiaWF0IjoxNzczMTE0MDc3LCJqdGkiOiI5MWNlZGFjYi1jY2FkLTRlYTEtYjczYS04ODZiYmViMTk3N2UifQ.BR7T7oXDnmLz6-NPsa3YRIT89PXo3ouYuZryQaY8s5A0RlHD2j5asY3EXbHCr8RCgjLV_rhX496UWKz4JsW5rU0i-hFdapki2hVgDPtH98hYRaWYzZyxHgGhlr6wHkuGNKpWlv1sKlj6hsj8MY9WfmhBh4Qg-7pTtwoTUzdaFZgGlnAB62WkFuj66j4Mh8FRr8YuyjHl6meOJCF8KuIJYgRZ0wFGbHjZWWbI1nVk5zOxxZ19HjdWv43LsOl11mJul4Ts7Ymn7bo4RROt4PiZLk8O2j7p9mqylBBRw-4bkxorcvZ0C2BJcbg34AoNxhRVgxvo_r3E-eIn58VZzxZz_Q"
      authInfo.tenant = "58197260";
    } else {
      authInfo = (await getAuthInfo()) as CubeAuth;
    }
    authInfo.token = authInfo.token.includes("Bearer") ? authInfo.token.split(" ")[1] : authInfo.token;
    initAuthStore(authInfo);
    genericAuthStore(authInfo);
    streamInitAuthStore(authInfo);
    initAppDesignAuthStore(authInfo);
    initTodoCenterAuthStore(authInfo);
    initAssetManagementAuthStore(authInfo);
    initAlarmCenterAuthStore(authInfo);
    initDailyTaskAuthStore(authInfo);
    setCustomHeaders({
      Authorization: authInfo.token.includes("Bearer") ? authInfo.token : "Bearer " + authInfo.token,
      tenant: authInfo.tenant,
      terminal: authInfo.terminal,
    });
  }

  private setCurrentSesstion(): void {
    // 设置集团tenant
    const urlParams = getUrlParams();
    if (urlParams.marketTenant !== undefined) {
      sessionStorage.setItem("marketTenant", urlParams.marketTenant);
    }
    if (urlParams.headTenant !== undefined) {
      sessionStorage.setItem("headTenant", urlParams.headTenant);
    }
    // 设置是否为app
    const loadEnv = getEnvironment();
    if (loadEnv === "cubeApp") {
      sessionStorage.setItem("isApp", "1");
    } else {
      sessionStorage.removeItem("isApp");
    }
  }

  private installStore(app: App<Element>): void {
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate);
    app.use(pinia);
  }

  private installRouter(app: App<Element>): void {
    const base = "/apps/grid-management/h5";
    const router = createRouter({
      history: createWebHashHistory(base),
      routes,
    });
    app.use(router);
  }

  private mount(app: App<Element>): void {
    app.mount("#app");
  }
}
