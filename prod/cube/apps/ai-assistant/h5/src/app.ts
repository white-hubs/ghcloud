import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createApp, type App } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import { initAuthStore as initGenericComponentAuth } from "@ghcloud/cube-app-generic-component";
import { getEnvironment, setCustomHeaders } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { installH5AuthGuard } from "@ghcloud/cube-h5-auth";
import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";

import { authStore, initAuthStore } from "./api/auth-store.ts";
import { routes } from "./router/index.ts";
import { getUrlParams } from "./utils/index.ts";

interface RenderProps {
  container?: Element | string;
  base?: string;
}

export class Application {
  private normalizeToken(token: string): string {
    return token.replace(/^bearer\s+/i, "");
  }

  public async install(): Promise<void> {
    // 处理鉴权信息
    await this.handleAuthStore();
    this.setCurrentSesstion();
    const { App: component } = await import("./app.tsx");
    const app = createApp(component);
    this.installStore(app);
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
        "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIzNTM3OTgyOSIsIjcyNzM0MjExIiwiNDM5NTAyNDIiLCI5MjUzNDQwMyIsIjUxMjU5NzM1IiwiOTkxNzQxMTMiLCI1Njk1MDg5NiIsIjc2MTI1MTk4IiwiMTU0NDEyNzkiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMC4yNDM6MTAwODYiLCJhZG1pbiI6ZmFsc2UsInBhc3N3b3JkX2ZvcmNlZCI6dHJ1ZSwiYXVkIjoiY2xpZW50XzIiLCJwYXNzd29yZF9leHBpcmF0aW9uX3JlbWluZGVkIjpmYWxzZSwibmJmIjoxNzgzNDA0NzQyLCJhZG1pbmlzdHJhdGVkX3RlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIzNTM3OTgyOSIsIjcyNzM0MjExIiwiNDM5NTAyNDIiLCI5MjUzNDQwMyIsIjUxMjU5NzM1IiwiOTkxNzQxMTMiLCI1Njk1MDg5NiIsIjc2MTI1MTk4IiwiMTU0NDEyNzkiXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLotoXnuqfnrqHnkIblkZgzIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9kYXRlIjp7ImRhdGUiOnsieWVhciI6MjAyNiwibW9udGgiOjksImRheSI6MTd9LCJ0aW1lIjp7ImhvdXIiOjE2LCJtaW51dGUiOjU2LCJzZWNvbmQiOjI1LCJuYW5vIjowfX0sImlkIjoiMTQ3ODYzNjg4Njk4NDUyMzc3NyIsImV4cCI6MTg4MzQwNDc0MiwiaWF0IjoxNzgzNDA0NzQyLCJqdGkiOiI1ODBjMDk4Yi1lOWZhLTQ5YjUtOWJkMS0zZjVmZDJhNGQ2NTUifQ.iU7Y6Y5ZND7wGsZFD0OpqzaLrk8YMis4eGPgdhMC4MnQl3I0rC41IldUWb6mJjzxowJyj9yPo8qt9em_c-be9-KXp72Mc1d9EHiIkDKd3zx42C7eEacHedZ6zs_9DlamNfOPLCDOX2fkYhevjIRr_WT5Wof0j9eTgxd9N4AtIAVu6bmV8ocwURTFv56YU2vi1QHnFl_zULoZi6GYbye3nNiig6-Dr7NxuE2cW_9A8DxySDOoP312OgdYBSe59Faem6a6n5DB0kzFC-booxfEZ_y9c_ggUKBCtbQL_mmRpj0LMe3e5mFs-OI1q8yDvku2Jup9tIKEUhR1vDw5nViNBg";
      authInfo.tenant = "58197260";
    } else {
      authInfo = (await getAuthInfo()) as CubeAuth;
    }
    this.syncAuthInfo(authInfo);
  }

  private syncAuthInfo(authInfo: CubeAuth): void {
    const normalizedAuthInfo = {
      ...authInfo,
      token: this.normalizeToken(authInfo.token),
      terminal: authInfo.terminal ?? CubeTerminalEnum.APP,
    };
    initAuthStore(normalizedAuthInfo);
    initGenericComponentAuth(normalizedAuthInfo);
    setCustomHeaders({
      Authorization: normalizedAuthInfo.token.includes("Bearer") ? normalizedAuthInfo.token : "Bearer " + normalizedAuthInfo.token,
      tenant: normalizedAuthInfo.tenant,
      terminal: normalizedAuthInfo.terminal,
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
    const base = "/apps/ai-assistant-chat/h5";
    const router = createRouter({
      history: createWebHashHistory(base),
      routes,
    });
    installH5AuthGuard(router, {
      loginPath: "/auth/login",
      defaultRedirectPath: "/",
      showGuestEnter: false,
      getToken: () => authStore.token,
      isInApp: () => getEnvironment() === "cubeApp",
      onAuthChanged: (authInfo) => {
        this.syncAuthInfo({
          token: authInfo.token,
          tenant: authInfo.tenant,
          terminal: CubeTerminalEnum.APP,
        });
      },
      onAuthCleared: () => {
        this.syncAuthInfo({ token: "", tenant: "", terminal: CubeTerminalEnum.APP });
      },
    });
    app.use(router);
  }

  private mount(app: App<Element>): void {
    app.mount("#app");
  }
}
