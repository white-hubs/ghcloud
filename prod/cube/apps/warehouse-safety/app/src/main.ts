import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

import { CubeTerminalEnum } from "@ghcloud/cube-protocol";
import { authRequest, DEV_MOCK_AUTH, type AuthState } from "@ghcloud/cube-services-client/auth-request";
import { initGenericComponentAuth } from "@ghcloud/generic-component";

import { initAuthStore } from "./api/auth-store";
import { readSessionAuth } from "./api/read-session-auth";
import { Application } from "./app";

const appBasePath = "/portal/warehouse-safety";

class Main {
  private app?: Application;

  public static run(): void {
    new Main().init();
  }

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
      initGenericComponentAuth({ tenant: String(DEV_MOCK_AUTH.tenant), token: DEV_MOCK_AUTH.token });
    }
    this.app = new Application({ base: "/apps/warehouse-safety" });
    void this.app.install();
  }

  private initAuth(auth: { tenant: string; token: string }): void {
    const normalized = {
      tenant: auth.tenant,
      token: auth.token.replace(/^Bearer\s+/i, "").trim(),
    };
    initAuthStore(normalized);
    initGenericComponentAuth(normalized);
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
          initGenericComponentAuth({ tenant: String(propsAuth.tenant), token: propsAuth.token });
        } else {
          this.initAuth(readSessionAuth());
        }
        this.app = new Application({ base: props.base ?? appBasePath, ...props });
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
