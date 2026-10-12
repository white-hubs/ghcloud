import { initAuthStore } from "./api/auth-store.ts";
import { routes } from "./router/index.ts";
import { getUrlParams } from "./utils/index.ts";
import { initAuthStore as streamInitAuthStore } from "@ghcloud-legacy/streamengine-h5-migrate/src/service/auth-store.ts";
import { initAuthStore as genericAuthStore } from "@ghcloud/cube-app-generic-component";
import { getEnvironment, setCustomHeaders } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
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
    this.installStore(app);
    this.installRouter(app);
    this.mount(app);
    this.#app = app;
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
        "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIxNzgzNTMxNCIsIjM1Mzc5ODI5IiwiNzI3MzQyMTEiLCI0Mzk1MDI0MiIsIjkyNTM0NDAzIiwiNTEyNTk3MzUiLCI5OTE3NDExMyIsIjU2OTUwODk2IiwiNzYxMjUxOTgiLCIxNTQ0MTI3OSJdLCJwYXNzd29yZF9leHBpcmVkIjpmYWxzZSwidXNlcl9uYW1lIjoiMTczMTEzNjk3ODIiLCJpc3MiOiJodHRwOi8vMTkyLjE2OC4wLjI0MzoxMDA4NiIsImFkbWluIjpmYWxzZSwicGFzc3dvcmRfZm9yY2VkIjp0cnVlLCJhdWQiOiJjbGllbnRfMiIsInBhc3N3b3JkX2V4cGlyYXRpb25fcmVtaW5kZWQiOmZhbHNlLCJuYmYiOjE3NzkwOTM5NTcsImFkbWluaXN0cmF0ZWRfdGVuYW50cyI6WyI1ODE5NzI2MCIsIjU5OTk2MDUyIiwiMTgzMjE2MDIiLCI4Mjk3MDE0MCIsIjYyMjIwODk3IiwiNDYyNDI3MjgiLCI0NzU3ODE2MSIsIjYwNTE2MjY4IiwiNTU3NjQzNSIsIjE3ODM1MzE0IiwiMzUzNzk4MjkiLCI3MjczNDIxMSIsIjQzOTUwMjQyIiwiOTI1MzQ0MDMiLCI1MTI1OTczNSIsIjk5MTc0MTEzIiwiNTY5NTA4OTYiLCI3NjEyNTE5OCIsIjE1NDQxMjc5Il0sInNjb3BlIjpbInNlbGVjdCJdLCJuYW1lIjoi6LaF57qn566h55CG5ZGYMyIsInBhc3N3b3JkX2V4cGlyYXRpb25fZGF0ZSI6eyJkYXRlIjp7InllYXIiOjIwMjYsIm1vbnRoIjo5LCJkYXkiOjE3fSwidGltZSI6eyJob3VyIjoxNiwibWludXRlIjo1Niwic2Vjb25kIjoyNSwibmFubyI6MH19LCJpZCI6IjE0Nzg2MzY4ODY5ODQ1MjM3NzciLCJleHAiOjE4NzkwOTM5NTcsImlhdCI6MTc3OTA5Mzk1NywianRpIjoiZWMxMTYzMGQtZWQ5ZC00OTAxLWE5MWUtZGU2NmJlNWJlZWZiIn0.Xrwhm834p5KCURehhFoxnWC52psX-nuMkQB0NLnRrW-x6XOArWrH69KqvzNmqFcDQ2mf0H6jDg53sutYkwUyMzD_pZw9-cJZucDFOs4KDHWkHOcsz6FG92wgCZmlPT8QYslkB55i95qOsbrGNDI9XIi1i2lzjkB3EiOV2zw7O-FgKQTMKibLGKAzq4SbT-tIPNYWFWq0Dekk5Hw12egFRGy0RUhX5rnChaziniWA8_y3L5DQc9U7X36WyTYfeJQViBuSuSEcWP3Dhg1okSnl1YG9qaaRiG6j1nBbqlWxhUE54BTRIrA2EYFSHjoDufemCslw_aBSTPUh2VqXPv7Kzw";
      authInfo.tenant = "58197260";
    } else {
      authInfo = (await getAuthInfo()) as CubeAuth;
    }
    authInfo.token = authInfo.token.includes("Bearer") ? authInfo.token.split(" ")[1] : authInfo.token;
    initAuthStore(authInfo);
    genericAuthStore(authInfo);
    streamInitAuthStore(authInfo);
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
    const base = "/apps/daily-inspection/h5";
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
