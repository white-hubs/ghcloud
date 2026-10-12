import { initAuthStore } from "./api/auth-store.ts";
import { routes } from "./router/index.ts";
import { initAuthStore as genericAuthStore } from "@ghcloud/cube-app-generic-component";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";
import { initCubePlayerAuth } from "@ghcloud/cube-player";
import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";
import { createApp, type App } from "vue";
import "vant/es/toast/style";
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
    const runingEnvironment = getEnvironment();
    let authInfo = {
      token: "",
      tenant: "",
      terminal: CubeTerminalEnum.APP,
    };
    // 方便开发时自定义token
    if (env === "dev" && runingEnvironment !== "cubeApp") {
      authInfo.token =
        "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNjg1NDcxMjgiXSwicGFzc3dvcmRfZXhwaXJlZCI6dHJ1ZSwidXNlcl9uYW1lIjoiMTczOTYyMjI0MzgiLCJpc3MiOiJodHRwOi8vMTAuMTAuMjIuMjQ0OjQwMDkiLCJhZG1pbiI6ZmFsc2UsInBhc3N3b3JkX2ZvcmNlZCI6dHJ1ZSwiYXVkIjoiY2xpZW50XzIiLCJwYXNzd29yZF9leHBpcmF0aW9uX3JlbWluZGVkIjp0cnVlLCJuYmYiOjE3Njg0NzUxNDcsImFkbWluaXN0cmF0ZWRfdGVuYW50cyI6W10sInNjb3BlIjpbInNlbGVjdCJdLCJuYW1lIjoi5pav5rabIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9kYXRlIjp7ImRhdGUiOnsieWVhciI6MjAyNSwibW9udGgiOjksImRheSI6MTZ9LCJ0aW1lIjp7ImhvdXIiOjksIm1pbnV0ZSI6NTksInNlY29uZCI6MzgsIm5hbm8iOjB9fSwiaWQiOiIxODU1ODEyODY2MDUxOTgxMzE0IiwiZXhwIjoxODY4NDc1MTQ3LCJpYXQiOjE3Njg0NzUxNDcsImp0aSI6ImIzYjg0YTY3LTNkZTItNDMwNS04OGZmLWFlZDExYWZmZGE2YyJ9.nFRBcSS52mWvKmmh9p-T2TlYg5TGg_11Nl-wbpw3uC4DnHrU4v_hWW2vkoBXBCautpn-2CGzgOn590LWkWYSvU30IrcPSE_sjqww7QuvH8kRltKEbMBJQIYfdALxoICVDfsFNkvfcLwdoHV3JJlEA7vYEmB8luFlPvOSlYAgYYk-K9yVA8R5Je7ZxOOr4Gji3cB47nyZaTGDHZ4oeVqFWQgD_oJN1ojQ-drqPcA4F67Xk0JYFyKbTZgmnRwjfHcd0qxYi5HKHupTSC97Ahd5-V37kskg7QLxm8hexGIqh8O_GVg3e75NHhn5Lxouve6dfcgLzLLXafx76tZDx8sk_w";
      authInfo.tenant = "68547128";
    } else {
      authInfo = (await getAuthInfo()) as CubeAuth;
    }
    initAuthStore(authInfo);
    genericAuthStore(authInfo);
    initCubePlayerAuth(authInfo);
  }

  private installRouter(app: App<Element>): void {
    const base = "/apps/alarm-center/h5";
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
