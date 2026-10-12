import { createApp, type App } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import { initAuthStore as initGenericComponentAuth } from "@ghcloud/cube-app-generic-component";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { installH5AuthGuard } from "@ghcloud/cube-h5-auth";

import { authStore, initAuthStore } from "./api/auth-store.ts";
import { reloadServer } from "./api/server.ts";
import { routes } from "./router/index.ts";
import { getDeviceFingerprint, getUrlParams } from "./utils/index.ts";

export class Application {
  private normalizeToken(token: string): string {
    return token.replace(/^bearer\s+/i, "");
  }

  public async install(): Promise<void> {
    // 处理鉴权信息
    await this.handleAuthStore();
    getDeviceFingerprint();
    this.setCurrentSesstion();
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
      terminal: "bimops-manage-app",
    };
    // 方便开发时自定义token
    if (env.includes("dev") && runingEnvironment !== "cubeApp") {
      authInfo.token =
        "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiMTc0OTA4MTEiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiaXNzIjoiaHR0cDovLzEwLjE0Mi45NS4yMjU6NDAwOSIsImFkbWluIjpmYWxzZSwicGFzc3dvcmRfZm9yY2VkIjpmYWxzZSwiYXVkIjoiY2xpZW50XzIiLCJwYXNzd29yZF9leHBpcmF0aW9uX3JlbWluZGVkIjpmYWxzZSwibmJmIjoxNzgyMjkxMTE4LCJhZG1pbmlzdHJhdGVkX3RlbmFudHMiOlsiMTc0OTA4MTEiXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLotoXnuqfnrqHnkIblkZgiLCJpZCI6IjE4MTE4MjcxMzg5NTE2OTIyODkiLCJleHAiOjE4ODIyOTExMTgsImlhdCI6MTc4MjI5MTExOCwianRpIjoiNmIzNTAxODgtMjc0OC00ZGM2LWFhMjktMjlhNGM5YTA3NzQ1In0.hkBxIg6ZpLEPKXv9isD2-de22h-3fPx_m8oIELpPQI4_FLLtIT9sv_koJEHgPZLCeQS61bqY_4_HPgBPGgomb-JNv2RANb7J4taKhhQNMiy8t2HEMFNkLfNSI-eFrsSbDLSYemudqKz0qZV7PK4Vo3NVJjkNwdR9whuHpej-i_xzwAE5xyh10Ka-gf4njLEoc_XeEM2CgVa3KSJwUEjArvXhshSkpwxrZN-hZF5EMT4_MQ8I2xxz_6Jm2iuyZj3Ie8phaY0YQks4wfpEM2477HFH6P5DdpAKeb71lJXprs73TqZ7SNuwDmK4yifZclNmIsoO-_7imKwSmiX1RhyAfw";
      authInfo.tenant = "17490811";
    } else {
      authInfo = await getAuthInfo();
      authInfo.token = this.normalizeToken(authInfo.token);
    }
    initAuthStore(authInfo);
    reloadServer();
    initGenericComponentAuth(authInfo);
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

  private installRouter(app: App<Element>): void {
    const base = "/apps/secure-edu/h5";
    const router = createRouter({
      history: createWebHashHistory(base),
      routes,
    });
    installH5AuthGuard(router, {
      loginPath: "/auth/login",
      defaultRedirectPath: "/entry",
      showGuestEnter: false,
      getToken: () => authStore.token,
      isInApp: () => false,
      onAuthChanged: (authInfo) => {
        initAuthStore(authInfo);
        reloadServer();
        initGenericComponentAuth(authInfo);
      },
      onAuthCleared: () => {
        const emptyAuthInfo = { token: "", tenant: "", terminal: "bimops-manage-app" };
        initAuthStore(emptyAuthInfo);
        reloadServer();
        initGenericComponentAuth(emptyAuthInfo);
      },
    });
    app.use(router);
  }

  private mount(app: App<Element>): void {
    app.mount("#app");
  }
}
