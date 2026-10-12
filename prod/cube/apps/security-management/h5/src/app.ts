import { createApp, type App } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import { initAuthStore as initAlarmCenterAuth } from "@ghcloud/cube-alarm-center-h5/src/api/auth-store.ts";
import { initAuthStore as initGenericComponentAuth } from "@ghcloud/cube-app-generic-component";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { initCubePlayerAuth } from "@ghcloud/cube-player";
import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";

import { initAuthStore } from "./api/auth-store.ts";
import { routes } from "./router/index.ts";

interface RenderProps {
  container?: Element | string;
  base?: string;
}

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
    const { App: component } = await import("./app.tsx");
    const app = createApp(component);
    this.installRouter(app);
    this.mount(app);
    this.#app = app;
  }

  public async uninstall(): Promise<void> {
    this.app.unmount();
  }

  private async handleAuthStore(): Promise<void> {
    const env = (import.meta as unknown as { env: { MODE: string } }).env.MODE;
    let authInfo: CubeAuth = {
      token: "",
      tenant: "",
      terminal: CubeTerminalEnum.BUSINESS,
    };
    // 方便开发时自定义token
    if (env === "dev") {
      authInfo.token =
        "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNjg1NDcxMjgiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE1ODEzODIwNjI2IiwiaXNzIjoiaHR0cDovLzEwLjEwLjIyLjI0NDo0MDA5IiwiYWRtaW4iOmZhbHNlLCJwYXNzd29yZF9mb3JjZWQiOnRydWUsImF1ZCI6ImNsaWVudF8yIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9yZW1pbmRlZCI6ZmFsc2UsIm5iZiI6MTc4Mjk3Mjc4NSwiYWRtaW5pc3RyYXRlZF90ZW5hbnRzIjpbXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLnjovnjonlkJsiLCJwYXNzd29yZF9leHBpcmF0aW9uX2RhdGUiOnsiZGF0ZSI6eyJ5ZWFyIjoyMDI2LCJtb250aCI6OCwiZGF5IjoyOH0sInRpbWUiOnsiaG91ciI6MTQsIm1pbnV0ZSI6NTUsInNlY29uZCI6MjIsIm5hbm8iOjB9fSwiaWQiOiIxNzkwNjc4NTU4ODc0MDc1MTM4IiwiZXhwIjoxODgyOTcyNzg1LCJpYXQiOjE3ODI5NzI3ODUsImp0aSI6IjZiYzZiYWFhLWZmMmMtNDIwMi05Y2YwLTUwZjM5YjUwMDE4MSJ9.gc-R4RrQyaM_JnYA5QxKYLvFrV_khC4VK7d7i2jvBpGEsd3M6U-Ns0DCskXrhiWb797xCf85ZZIi_abmtyeOz0IO1znKqXMFJoSM9RKsJwk7D9FV34Kpv_o3KCjfs3_a3HX_5tdou5w79p_4uW5tc-okYii_INsKTvol4l2BsGC9B2Vqes-0TLRuRyhk5Elbs21VIt0wqPSh9usDTBZGD6ZJIUHpuChhv1-UeK-hSqi0AD8iD7gYEu3t6-1HXFqlaNSgUYGutfWyCN3I94IJPOTcR2cXjxd0dt61NmIrangrZ8-PWKgxWT_RD1YSm8XWaEo2ZSjYKBQm0CYjQS3unw";
      ((authInfo.tenant = "68547128"), (authInfo.terminal = CubeTerminalEnum.APP));
    } else {
      authInfo = await getAuthInfo();
    }
    initAuthStore(authInfo);
    initGenericComponentAuth(authInfo);
    initAlarmCenterAuth(authInfo);
    initCubePlayerAuth(authInfo);
  }

  private installRouter(app: App<Element>): void {
    const base = "/apps/@ghcloud/cube-security-management-h5";
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
