import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

import { authRequest, DEV_MOCK_AUTH, type AuthState } from "@ghcloud/cube-services-client/auth-request";

import { initAuthStore } from "./api/auth-store";
import { Application } from "./app";
import { ensureApplicationSessionContext } from "./bootstrap/ensure-application-session";
import { prepareCubePlayer, syncCubePlayerAuth } from "./bootstrap/prepare-cube-player";
import { readSessionAuth } from "./bootstrap/read-session-auth";

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
    const sessionAuth = readSessionAuth();
    if (sessionAuth?.token) {
      this.initAuth(sessionAuth);
    } else {
      ensureApplicationSessionContext({ tenantCode: DEV_MOCK_AUTH.tenant });
      authRequest.updateAuth(DEV_MOCK_AUTH);
      initAuthStore(DEV_MOCK_AUTH);
      syncCubePlayerAuth();
    }
    this.app = new Application({ base: "/apps/emergency-dispatch" });
    void prepareCubePlayer().then(() => this.app?.install());
  }

  private initAuth(auth: AuthState): void {
    const normalizedAuth: AuthState = {
      tenant: auth.tenant,
      terminal: auth.terminal || DEV_MOCK_AUTH.terminal,
      token: auth.token.replace(/^Bearer\s+/i, "").trim(),
    };
    ensureApplicationSessionContext({ tenantCode: normalizedAuth.tenant });
    authRequest.updateAuth(normalizedAuth);
    initAuthStore(normalizedAuth);
    syncCubePlayerAuth();
  }

  private renderWithQiankun(): void {
    renderWithQiankun({
      bootstrap: this.bootstrap.bind(this),
      mount: this.mount.bind(this),
      unmount: this.unmount.bind(this),
      update: this.update.bind(this),
    });
  }

  private bootstrap(): void {
    return undefined;
  }

  private mount(props: QiankunProps): void {
    const { auth } = props as { auth?: AuthState };
    const resolvedAuth = auth?.token ? auth : readSessionAuth();
    if (resolvedAuth?.token) {
      this.initAuth(resolvedAuth);
    } else {
      ensureApplicationSessionContext({ tenantCode: DEV_MOCK_AUTH.tenant });
      authRequest.updateAuth(DEV_MOCK_AUTH);
      initAuthStore(DEV_MOCK_AUTH);
      syncCubePlayerAuth();
    }
    this.app = new Application({ base: "/portal/emergency-dispatch", ...props });
    void prepareCubePlayer().then(() => this.app?.install());
  }

  private unmount(): void {
    this.app?.uninstall();
  }

  private update(): void {
    return undefined;
  }
}

Main.run();
