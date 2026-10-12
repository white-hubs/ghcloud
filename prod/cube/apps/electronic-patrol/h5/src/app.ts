import { initAuthStore } from "./api/auth-store.ts";
import { routes } from "./router/index.ts";
import { getUrlParams } from "./utils/index.ts";
import { initAuthStore as initGenericComponentAuth } from "@ghcloud/cube-app-generic-component";
import { getEnvironment, setCustomHeaders } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
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
        "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNTgxOTcyNjAiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjEzNjg5MDQwNzEwIiwiaXNzIjoiaHR0cDovLzEwLjEyNS4xMC4yNDQ6MTAwODQiLCJhZG1pbiI6ZmFsc2UsInBhc3N3b3JkX2ZvcmNlZCI6ZmFsc2UsImF1ZCI6ImNsaWVudF8yIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9yZW1pbmRlZCI6ZmFsc2UsIm5iZiI6MTc3MjUzMDQ1OSwiYWRtaW5pc3RyYXRlZF90ZW5hbnRzIjpbXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLov5Dnu7TlvKDkuIkiLCJwYXNzd29yZF9leHBpcmF0aW9uX2RhdGUiOnsiZGF0ZSI6eyJ5ZWFyIjoyMDI2LCJtb250aCI6MywiZGF5IjoxN30sInRpbWUiOnsiaG91ciI6OSwibWludXRlIjoxOSwic2Vjb25kIjoyOCwibmFubyI6MH19LCJpZCI6IjE1NjczODA2NjQwNzA3Nzg4ODIiLCJleHAiOjE4NzI1MzA0NTksImlhdCI6MTc3MjUzMDQ1OSwianRpIjoiYTMwYmE2YmItMWE3Ni00OTBmLTg0YzItYjg4NjZiOWRkMmRjIn0.Qo3CTt-wDwGw-6dBGq5EfDBRmjqBppBQ57w294lfRVgELXtGRFMWhP27D5ga_1PzV3liQf82prAo0H3ShnUtXCGmENyBgYX0xm1TAEv3PZJBw5JNbs_F2PLwobKTHvY8FZa31pN8cJH576x2S0FZ5nAalvQn-FjSIKyH57WFcC_9mfV4ciDdOixexNenHW0F-M0U7o8saCrNG0mffDJH1aEca6D2JzATLOwYv_IFrgUtSyLyesXxSzhAWh7KAZqopeOuFlNmUc5Xg6SFsgAR5eIomjka_JGcoV6n653aXx4drq9fSf6SUhCuNyqpl8kc8dTIjGI34wE3f-ATyW7XRg";
      authInfo.tenant = "58197260";
    } else {
      authInfo = await getAuthInfo();
    }
    authInfo.token = authInfo.token.includes("Bearer") ? authInfo.token.split(" ")[1] : authInfo.token;
    initAuthStore(authInfo);
    initGenericComponentAuth(authInfo);
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

  private installRouter(app: App<Element>): void {
    const base = "/apps/electronic-patrol/h5";
    const router = createRouter({
      history: createWebHashHistory(base),
      routes,
    });
    (window as any).__CUBE_H5_VUE_ROUTER__ = router;
    app.use(router);
  }

  private mount(app: App<Element>): void {
    app.mount("#app");
  }
}
