import { initAuthStore } from "./api/auth-store.ts";
import { routes } from "./router/index.ts";
import { initAuthStore as alarmInitAuthStore } from "@ghcloud/cube-alarm-center-h5/src/api/auth-store.ts";
import { initAuthStore as initGenericComponentAuth } from "@ghcloud/cube-app-generic-component";
import { cubeWxService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { initCubePlayerAuth } from "@ghcloud/cube-player";
import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";
import { createApp, type App } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

export class Application {
  #app?: App<Element>;

  private get app(): App<Element> {
    if (!this.#app) {
      throw new Error("app not initialized!");
    }
    return this.#app;
  }

  public async install(): Promise<void> {
    // 处理鉴权信息
    await this.handleAuthStore();
    const { App: component } = await import("./app.tsx");
    const app = createApp(component);
    this.installRouter(app);
    this.mount(app);
    this.#app = app;
  }

  private async handleAuthStore(): Promise<void> {
    const env = (import.meta as unknown as { env: { MODE: string } }).env.MODE;
    const runingEnvironment = getEnvironment();
    let authInfo: CubeAuth = {
      token: "",
      tenant: "",
      terminal: CubeTerminalEnum.APP,
    };
    // 微信小程序
    const isWxMini = await cubeWxService.getWxEnv();
    // 方便开发时自定义token
    if (env === "dev" && runingEnvironment !== "cubeApp" && !isWxMini) {
      authInfo.token =
        "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIxNzgzNTMxNCIsIjM1Mzc5ODI5IiwiNzI3MzQyMTEiLCI0Mzk1MDI0MiIsIjkyNTM0NDAzIiwiNTEyNTk3MzUiLCI5OTE3NDExMyIsIjU2OTUwODk2IiwiNzYxMjUxOTgiLCIxNTQ0MTI3OSJdLCJwYXNzd29yZF9leHBpcmVkIjpmYWxzZSwidXNlcl9uYW1lIjoiMTczMTEzNjk3ODIiLCJpc3MiOiJodHRwOi8vMTkyLjE2OC4wLjI0MzoxMDA4NiIsImFkbWluIjpmYWxzZSwicGFzc3dvcmRfZm9yY2VkIjp0cnVlLCJhdWQiOiJjbGllbnRfMiIsInBhc3N3b3JkX2V4cGlyYXRpb25fcmVtaW5kZWQiOmZhbHNlLCJuYmYiOjE3Nzg1ODU1MTYsImFkbWluaXN0cmF0ZWRfdGVuYW50cyI6WyI1ODE5NzI2MCIsIjU5OTk2MDUyIiwiMTgzMjE2MDIiLCI4Mjk3MDE0MCIsIjYyMjIwODk3IiwiNDYyNDI3MjgiLCI0NzU3ODE2MSIsIjYwNTE2MjY4IiwiNTU3NjQzNSIsIjE3ODM1MzE0IiwiMzUzNzk4MjkiLCI3MjczNDIxMSIsIjQzOTUwMjQyIiwiOTI1MzQ0MDMiLCI1MTI1OTczNSIsIjk5MTc0MTEzIiwiNTY5NTA4OTYiLCI3NjEyNTE5OCIsIjE1NDQxMjc5Il0sInNjb3BlIjpbInNlbGVjdCJdLCJuYW1lIjoi6LaF57qn566h55CG5ZGYMyIsInBhc3N3b3JkX2V4cGlyYXRpb25fZGF0ZSI6eyJkYXRlIjp7InllYXIiOjIwMjYsIm1vbnRoIjo5LCJkYXkiOjE3fSwidGltZSI6eyJob3VyIjoxNiwibWludXRlIjo1Niwic2Vjb25kIjoyNSwibmFubyI6MH19LCJpZCI6IjE0Nzg2MzY4ODY5ODQ1MjM3NzciLCJleHAiOjE4Nzg1ODU1MTYsImlhdCI6MTc3ODU4NTUxNiwianRpIjoiNThjYTExMTYtMDAzNy00NGM3LTg3M2YtMjZkMWJkNWZmZWM1In0.f5zfdey0M7gS9m9_QF_HpEnJtSi4OfGFHEyxUaBiJZ4zqKbOslht7R2XJJOX_xGUisW_w-2tw4YCV2ua2SlcsiVVANdG5CYKNJdYYLVVJ6aSZJ2PYVr2nC_F_u9z8TtnBRjm7PVjNQheHgavxkBgGeRrpVyLbKx5ryPSjDFEnT8KJnirYaXJjCNk9naZCjpaIYJ5kIj38Z3JR9jRQrcR7kkabH_I4HWuxm1hkSopb9vQDGBT9mnHwHkwJhwQUF6DFYdtxVdtM4EYrAdGVPB5cH507oF7uWHkitg47Jf06ih_36WRo4HxFRojuCEko0yIU9XlXgfBIGdn8qx8xP6pPg";
      authInfo.tenant = "58197260";
    } else {
      authInfo = await getAuthInfo();
    }
    initAuthStore(authInfo);
    alarmInitAuthStore(authInfo);
    initGenericComponentAuth(authInfo);
    initCubePlayerAuth(authInfo);
  }

  private installRouter(app: App<Element>): void {
    const base = "/apps/@ghcloud/cube-iot-center-h5";
    const router = createRouter({
      history: createWebHashHistory(base),
      routes,
    });
    // @ts-expect-error
    window.__CUBE_H5_VUE_ROUTER__ = router;
    app.use(router);
  }

  private mount(app: App<Element>): void {
    app.mount("#app");
  }
}
