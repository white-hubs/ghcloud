import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createApp, type App } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import { initAuthStore as genericAuthStore } from "@ghcloud/cube-app-generic-component";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config.ts";
import { getAuthInfo } from "@ghcloud/cube-auth-utils";
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
    this.installStore(app);
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
        "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIzNTM3OTgyOSIsIjcyNzM0MjExIiwiNDM5NTAyNDIiLCI5MjUzNDQwMyIsIjUxMjU5NzM1IiwiOTkxNzQxMTMiLCI1Njk1MDg5NiIsIjc2MTI1MTk4IiwiMTU0NDEyNzkiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMC4yNDM6MTAwODYiLCJhZG1pbiI6ZmFsc2UsInBhc3N3b3JkX2ZvcmNlZCI6dHJ1ZSwiYXVkIjoiY2xpZW50XzIiLCJwYXNzd29yZF9leHBpcmF0aW9uX3JlbWluZGVkIjpmYWxzZSwibmJmIjoxNzgwOTA5NzAzLCJhZG1pbmlzdHJhdGVkX3RlbmFudHMiOlsiNTgxOTcyNjAiLCI1OTk5NjA1MiIsIjE4MzIxNjAyIiwiODI5NzAxNDAiLCI2MjIyMDg5NyIsIjQ2MjQyNzI4IiwiNDc1NzgxNjEiLCI2MDUxNjI2OCIsIjU1NzY0MzUiLCIzNTM3OTgyOSIsIjcyNzM0MjExIiwiNDM5NTAyNDIiLCI5MjUzNDQwMyIsIjUxMjU5NzM1IiwiOTkxNzQxMTMiLCI1Njk1MDg5NiIsIjc2MTI1MTk4IiwiMTU0NDEyNzkiXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLotoXnuqfnrqHnkIblkZgzIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9kYXRlIjp7ImRhdGUiOnsieWVhciI6MjAyNiwibW9udGgiOjksImRheSI6MTd9LCJ0aW1lIjp7ImhvdXIiOjE2LCJtaW51dGUiOjU2LCJzZWNvbmQiOjI1LCJuYW5vIjowfX0sImlkIjoiMTQ3ODYzNjg4Njk4NDUyMzc3NyIsImV4cCI6MTg4MDkwOTcwMywiaWF0IjoxNzgwOTA5NzAzLCJqdGkiOiJhZTgxZTA0MS03NTU4LTQzNTctODlkMC03MGQ3YzkxM2YyNzUifQ.WU6NOvW2gD07N_5I9zDbKPTwu2MLuVCfDmeX1-CyEWv6q1trA-Kk7DINzsoBADt0rVC7MBJ4akSdmVNuOH-Areba0Ra2W6GiUov-hNPJIwP_CPzSHKjp3-7JaQavnzPimH9375DhJBcYnVPi2g6-YORnfZAMZXJuxis5GLEvIvSikrDp5Dbk77oEEpqrzGjV2bPFNt26IQV1kElnTYXBfGGGydsS8wMuQPfaIgENyh7P2WYjDPGF1RB_wphJ-JzD5z5dqPyAIIQRAhs_Sh-duVC1Y2N3s16-INV5dBgqihS3GqNAu0jsRMae2ZHiM1mUJjiRhJr-wqk7smi7q8O3nw";
      authInfo.tenant = "58197260";
    } else {
      authInfo = (await getAuthInfo()) as CubeAuth;
    }
    initAuthStore(authInfo);
    genericAuthStore(authInfo);
  }
  private installRouter(app: App<Element>): void {
    const base = "/apps/todo-center/h5";
    const router = createRouter({
      history: createWebHashHistory(base),
      routes,
    });
    app.use(router);
  }

  private installStore(app: App<Element>): void {
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate);
    app.use(pinia);
  }
  private mount(app: App<Element>): void {
    app.mount("#app");
  }
}
