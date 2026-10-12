import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

import { apiProxy } from "@ghcloud/cube-app-design";
import { CubeTerminalEnum } from "@ghcloud/cube-protocol";
import { authRequest, DEV_MOCK_AUTH } from "@ghcloud/cube-services-client/auth-request";

import { initAuthStore } from "./api/auth-store";
import { readSessionAuth } from "./api/read-session-auth";
import { Application } from "./app";

class Main {
  public static run(): void {
    new Main().init();
  }

  private app?: Application;

  private init(): void {
    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
      this.renderWithDefault();
      return;
    }
    this.renderWithQiankun();
  }

  private syncFileUploadAuth(auth: { tenant?: string | number; token?: string }): void {
    const tenant = String(auth.tenant ?? "");
    const token = (auth.token ?? "").replace(/^Bearer\s+/i, "").trim();
    sessionStorage.setItem("GH-Token", JSON.stringify({ access_token: token }));
    sessionStorage.setItem("GH-NowEnterprise", JSON.stringify({ code: tenant }));
    apiProxy.updateAuth({
      tenant,
      terminal: CubeTerminalEnum.BUSINESS,
      token,
    });
  }

  private initAuth(auth: { tenant?: string; token?: string }): void {
    const token = (auth.token ?? "").replace(/^Bearer\s+/i, "").trim();
    if (!auth.tenant || !token) {
      authRequest.updateAuth(DEV_MOCK_AUTH);
      initAuthStore(DEV_MOCK_AUTH);
      this.syncFileUploadAuth(DEV_MOCK_AUTH);
      return;
    }
    authRequest.updateAuth({
      tenant: Number(auth.tenant) || 0,
      terminal: CubeTerminalEnum.BUSINESS,
      token,
    });
    initAuthStore({
      tenant: auth.tenant,
      terminal: CubeTerminalEnum.BUSINESS,
      token,
    });
    this.syncFileUploadAuth({ tenant: auth.tenant, token });
  }

  private renderWithDefault(): void {
    this.initAuth(readSessionAuth());
    this.app = new Application({ base: "/apps/safety-duty" });
    void this.app.install();
  }

  private renderWithQiankun(): void {
    renderWithQiankun({
      bootstrap: () => undefined,
      mount: (props: QiankunProps) => {
        const auth = (props as QiankunProps & { auth?: { tenant: string; token: string } }).auth;
        this.initAuth(auth ?? readSessionAuth());
        this.app = new Application({ base: "/portal/safety-duty", ...props });
        void this.app.install();
      },
      unmount: () => {
        void this.app?.uninstall();
      },
      update: () => undefined,
    });
  }
}

Main.run();
