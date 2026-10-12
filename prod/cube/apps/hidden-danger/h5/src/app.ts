import { initAuthStore } from "./api/auth-store.ts";
import { routes } from "./router/index.ts";
import { getUrlParams } from "./utils/index.ts";
import { initAuthStore as initGenericComponentAuth } from "@ghcloud/cube-app-generic-component";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { createApp, type App } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
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
        "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIxNzgzNTMxNCIsIjM1Mzc5ODI5IiwiNzI3MzQyMTEiLCI0Mzk1MDI0MiIsIjkyNTM0NDAzIiwiNTEyNTk3MzUiLCI5OTE3NDExMyIsIjU2OTUwODk2IiwiNzYxMjUxOTgiLCIxNTQ0MTI3OSJdLCJwYXNzd29yZF9leHBpcmVkIjpmYWxzZSwidXNlcl9uYW1lIjoiMTczMTEzNjk3ODIiLCJpc3MiOiJodHRwOi8vMTkyLjE2OC4wLjI0MzoxMDA4NiIsImFkbWluIjpmYWxzZSwicGFzc3dvcmRfZm9yY2VkIjp0cnVlLCJhdWQiOiJjbGllbnRfMiIsInBhc3N3b3JkX2V4cGlyYXRpb25fcmVtaW5kZWQiOmZhbHNlLCJuYmYiOjE3NzcyNTUwNTEsImFkbWluaXN0cmF0ZWRfdGVuYW50cyI6WyI1ODE5NzI2MCIsIjU5OTk2MDUyIiwiMTgzMjE2MDIiLCI4Mjk3MDE0MCIsIjYyMjIwODk3IiwiNDYyNDI3MjgiLCI0NzU3ODE2MSIsIjYwNTE2MjY4IiwiNTU3NjQzNSIsIjE3ODM1MzE0IiwiMzUzNzk4MjkiLCI3MjczNDIxMSIsIjQzOTUwMjQyIiwiOTI1MzQ0MDMiLCI1MTI1OTczNSIsIjk5MTc0MTEzIiwiNTY5NTA4OTYiLCI3NjEyNTE5OCIsIjE1NDQxMjc5Il0sInNjb3BlIjpbInNlbGVjdCJdLCJuYW1lIjoi6LaF57qn566h55CG5ZGYMyIsInBhc3N3b3JkX2V4cGlyYXRpb25fZGF0ZSI6eyJkYXRlIjp7InllYXIiOjIwMjYsIm1vbnRoIjo5LCJkYXkiOjE3fSwidGltZSI6eyJob3VyIjoxNiwibWludXRlIjo1Niwic2Vjb25kIjoyNSwibmFubyI6MH19LCJpZCI6IjE0Nzg2MzY4ODY5ODQ1MjM3NzciLCJleHAiOjE4NzcyNTUwNTEsImlhdCI6MTc3NzI1NTA1MSwianRpIjoiZjlhZmUyMjYtZDQ5Yy00OTQyLWEyNmItOTdhNmFiMDYxOWNmIn0.VW_oRi7UiVAENVO57qaDgNhW_GBuAiZq7UkFKNP3XvQxmU1l6FfsqAToXOfalbE8--B6veEh4TrLTCsnm-ERrQRKMz9ObTfupiLfnqqfVwpEbz6G12A7xxcDVkAJlOQYbzEqwamBOlGnjjmDGebe2cSPQA1NcP4m7WqyEpZtUGPLwlQsXiXkd62D025WPeMni6vBsqQ2jtgb_7wJZLXABuHROA7CIa8detD06AIrZVfWADTY5tJuoAJeLj2qSp72Lnh31gd09bBS8lr5Lhp5vUQyM0E4yRPwqs0wchbsEMAQ3_OnZ2ri0P-kTkp68GwkV8xOl2MUIcFqJX2F4ue3BA";
      authInfo.tenant = "58197260";
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
    const base = "/apps/hidden-danger/h5";
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
