import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

import { CubeTerminalEnum } from "@ghcloud/cube-protocol";

import { initAuthStore } from "./api/auth-store";
import { readSessionAuth } from "./api/read-session-auth";
import { Application } from "./app";
import { authRequest } from "./hooks/use-auth-request";

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

  private renderWithDefault(): void {
    const auth = readSessionAuth();
    this.initAuth(auth);
    this.app = new Application({ base: "/apps/security-opinion-monitoring" });
    void this.app.install();
  }

  private initAuth(auth: { tenant: string; token: string }): void {
    const normalized = {
      tenant: auth.tenant,
      token: auth.token.replace(/^Bearer\s+/i, "").trim(),
    };
    initAuthStore(normalized);
    authRequest.updateAuth({
      tenant: Number(normalized.tenant) || 0,
      terminal: CubeTerminalEnum.BUSINESS,
      token: normalized.token,
    });
  }

  private renderWithQiankun(): void {
    renderWithQiankun({
      bootstrap: () => undefined,
      mount: (props: QiankunProps) => {
        const auth = (props as QiankunProps & { auth?: { tenant: string; token: string } }).auth;
        this.initAuth(auth?.tenant && auth?.token ? auth : readSessionAuth());
        this.app = new Application({ base: "/portal/security-opinion-monitoring", ...props });
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
