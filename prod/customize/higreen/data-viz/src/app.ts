import { createApp, type App } from "vue";
import { createRouter, createWebHistory, type Router } from "vue-router";

import { getAuthInfo } from "@ghcloud/cube-auth-utils";

import { initAuthStore } from "./api/auth-store.ts";
import { initAppConfig, updateAppDocumentTitle } from "./config/app-config";
import { routes } from "./router";
import "amfe-flexible";

import "animate.css";

interface RenderProps {
  container?: Element | string;
  base?: string;
  router?: Router;
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
    await this.handleAuthStore();
    await initAppConfig();
    const { App: component } = await import("./app.tsx");
    const app = createApp(component);
    this.installRouter(app);
    this.mount(app);
    this.#app = app;
  }

  public async uninstall(): Promise<void> {
    this.app.unmount();
  }

  private installRouter(app: App<Element>): void {
    const { base = "" } = this.props;
    const router = createRouter({
      history: createWebHistory(base),
      routes,
    });
    router.afterEach((to) => {
      updateAppDocumentTitle(to.name);
    });
    app.use(router);
  }

  private mount(app: App<Element>): void {
    app.mount("#higreen-data-viz");
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
        "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjbGllbnRfMiIsInRlbmFudHMiOlsiNjg1NDcxMjgiXSwicGFzc3dvcmRfZXhwaXJlZCI6ZmFsc2UsInVzZXJfbmFtZSI6IjE1ODEzODIwNjI2IiwiaXNzIjoiaHR0cDovLzEwLjEwLjIyLjI0NDo0MDA5IiwiYWRtaW4iOmZhbHNlLCJwYXNzd29yZF9mb3JjZWQiOnRydWUsImF1ZCI6ImNsaWVudF8yIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9yZW1pbmRlZCI6ZmFsc2UsIm5iZiI6MTc4NDcwMDI4MSwiYWRtaW5pc3RyYXRlZF90ZW5hbnRzIjpbXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLnjovnjonlkJsiLCJwYXNzd29yZF9leHBpcmF0aW9uX2RhdGUiOnsiZGF0ZSI6eyJ5ZWFyIjoyMDI2LCJtb250aCI6OCwiZGF5IjoyOH0sInRpbWUiOnsiaG91ciI6MTQsIm1pbnV0ZSI6NTUsInNlY29uZCI6MjIsIm5hbm8iOjB9fSwiaWQiOiIxNzkwNjc4NTU4ODc0MDc1MTM4IiwiZXhwIjoxODg0NzAwMjgxLCJpYXQiOjE3ODQ3MDAyODEsImp0aSI6ImExNDAwNmQ5LTA0YjEtNGQ0Ny05YTI2LWY5ZDEyN2YwNzc0MCJ9.ERKcc-uH9Ip8d0DinH0azSZuiGecwy3LMe0fKcnkETWoEGo-aiWfJ9iClU5m-VaKi4O41Uo3g1f0rQwa3vU8svrIdfTTR8IA9o-qindciMOjp1k3L-11tN81Mshm7WVzOfd0mjbp58WdqgFwNqL-9hxag2W-vWrsxxPqb6G_DKStvy5zreamhdTQtRJTG1mbnYK30RamfLmHpMm-OD5HyOmEDzA59LWnjicDpSm3lgVdRNHsSBhahcNKyIqeJAS9usJA8BxPkKreGZQotAyJ7YVwUsPybEknS2cKpO1EcNhRFR4GpOLUcrXgCtyq2OjN_lg6OqajgyyCoB8aICyRzA";
      authInfo.tenant = "68547128";
    } else {
      authInfo = await getAuthInfo();
    }
    initAuthStore(authInfo);
    return new Promise<void>((resolve) => {
      resolve();
    });
  }
}
