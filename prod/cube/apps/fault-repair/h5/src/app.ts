import { createApp, type App } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import { initAuthStore as initGenericComponentAuth } from "@ghcloud/cube-app-generic-component";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";

import { initAuthStore } from "./api/auth-store.ts";
import { routes } from "./router/index.ts";
import { getUrlParams } from "./utils/index.ts";
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
    this.setCurrentSesstion();
    const { App: component } = await import("./app.tsx");
    const app = createApp(component);
    this.installRouter(app);
    this.mount(app);
    this.#app = app;
  }

  private async handleAuthStore(): Promise<void> {
    const env = (import.meta as unknown as { env: { MODE: string } }).env.MODE;
    let authInfo = {
      token: "",
      tenant: "",
      terminal: "bimops-manage-app",
    };
    // 方便开发时自定义token
    if (env === "dev") {
      authInfo.token =
        "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNjg1NDcxMjgiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiaXNzIjoiaHR0cDovLzEwLjEwLjIyLjI0NDo0MDA5IiwiYWRtaW4iOmZhbHNlLCJwYXNzd29yZF9mb3JjZWQiOnRydWUsImF1ZCI6ImNsaWVudF8yIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9yZW1pbmRlZCI6ZmFsc2UsIm5iZiI6MTc4MTU5MzQ3OCwiYWRtaW5pc3RyYXRlZF90ZW5hbnRzIjpbIjY4NTQ3MTI4Il0sInNjb3BlIjpbInNlbGVjdCJdLCJuYW1lIjoi6LaF57qn566h55CG5ZGYIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9kYXRlIjp7ImRhdGUiOnsieWVhciI6MjAyNiwibW9udGgiOjExLCJkYXkiOjIxfSwidGltZSI6eyJob3VyIjoxNCwibWludXRlIjoxNCwic2Vjb25kIjoyLCJuYW5vIjowfX0sImlkIjoiMTc4Mzc2NTk4MDU5ODU3OTIwMSIsImV4cCI6MTg4MTU5MzQ3OCwiaWF0IjoxNzgxNTkzNDc4LCJqdGkiOiI5MDAyYzRhZC04MTlmLTQyZWItODhkYi1mYjNjNGQ2NmY1N2YifQ.VSt2plDrEC3PCS7YzH72eLORD_BySFw49WJSC2ZzyKOLpxPGXQ0qE3ENvsD-vAWqnCBXTyChHf1u2yt6OyUWkCeZyc5jQM7UQMMuKVFIhJy2V7QOidKGLFDDNuYouzpe6ooctAQxO-N_n2WAbVN3IAw6Z2DI1kFsAjkmIqDFU2eoT2sPpV4EM9prtnsepb8qHOZYtNQSdLbFRjzSDNqApDGpk-0D86Bd6QMGqdlH2U7EPgl4JcHaQBKC5lf6qCOHcYdMPh_tHOK8yYgamMQzbAZaEfXv9dddp6XucJPC_lxzswJSHNtgLZgkuz0h1SCq2vMFJmgJvz5qT0SsBK1AKg";
      authInfo.tenant = "68547128";
    } else {
      authInfo = await getAuthInfo();
    }
    initAuthStore(authInfo);
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
    const base = "/apps/fault-repair/h5";
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
