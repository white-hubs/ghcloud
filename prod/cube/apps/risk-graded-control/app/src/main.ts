import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

import { CubeTerminalEnum } from "@ghcloud/cube-protocol";
import { DEV_MOCK_AUTH, type AuthState } from "@ghcloud/cube-services-client/auth-request";

import { initAuthStore } from "./api/auth-store";
import { readSessionAuth } from "./api/read-session-auth";
import { Application } from "./app";
import { authRequest } from "./hooks/use-auth-request";

class Main {
  public static run(): void {
    Main.initFileUploadFeature();
    new Main().init();
  }

  private static initFileUploadFeature(): void {
    const w = window as Window & { config?: { feature?: Record<string, unknown> } };
    w.config = w.config ?? {};
    w.config.feature = w.config.feature ?? {};
    w.config.feature.useUploadTemporary = true;
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
    if (auth.tenant && auth.token) {
      this.initAuth(auth);
    } else {
      authRequest.updateAuth(DEV_MOCK_AUTH);
      initAuthStore({ tenant: String(DEV_MOCK_AUTH.tenant), token: DEV_MOCK_AUTH.token });
    }
    this.app = new Application({ base: "/apps/risk-graded-control" });
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
        const propsAuth = (props as QiankunProps & { auth?: AuthState }).auth;
        if (propsAuth?.token) {
          authRequest.updateAuth(propsAuth);
          initAuthStore({ tenant: String(propsAuth.tenant), token: propsAuth.token });
        } else {
          this.initAuth(readSessionAuth());
        }
        this.app = new Application({ base: "/portal/risk-graded-control", ...props });
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
