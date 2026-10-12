import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

import { authRequest, DEV_MOCK_AUTH, type AuthState } from "@ghcloud/cube-services-client/auth-request";

import { Application } from "./app";
import { ensureApplicationSessionContext } from "./bootstrap/ensure-application-session";
import { readSessionAuth } from "./bootstrap/read-session-auth";
import { setPositioningSocketAuth } from "./bootstrap/socket-auth";
import { APP_ROUTE_PREFIX, APP_PUBLIC_PATH, USE_MOCK } from "./constants/env";

class Main {
  public static run(): void {
    new Main().init();
  }

  private app?: Application;

  private init(): void {
    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
      void this.renderWithDefault();
      return;
    }

    this.renderWithQiankun();
  }

  private async renderWithDefault(): Promise<void> {
    if (USE_MOCK) {
      const { setupMocks } = await import("./mocks");
      setupMocks();
    }
    const sessionAuth = readSessionAuth();
    if (sessionAuth?.token) {
      this.initAuth(sessionAuth);
    } else {
      ensureApplicationSessionContext({ tenantCode: DEV_MOCK_AUTH.tenant });
      authRequest.updateAuth(DEV_MOCK_AUTH);
      setPositioningSocketAuth(DEV_MOCK_AUTH);
    }
    this.app = new Application({ base: APP_PUBLIC_PATH });
    void this.app.install();
  }

  private initAuth(auth: AuthState): void {
    const normalizedAuth: AuthState = {
      tenant: auth.tenant,
      terminal: auth.terminal || DEV_MOCK_AUTH.terminal,
      token: auth.token.replace(/^Bearer\s+/i, "").trim(),
    };
    ensureApplicationSessionContext({ tenantCode: normalizedAuth.tenant });
    authRequest.updateAuth(normalizedAuth);
    setPositioningSocketAuth(normalizedAuth);
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
      setPositioningSocketAuth(DEV_MOCK_AUTH);
    }
    // qiankun 子应用的基础路径由主应用分配，须与 vite.config.ts 的 projectName、index.html 的 #PersonnelPositioning 保持一致
    this.app = new Application({ base: APP_ROUTE_PREFIX, ...props });
    void this.app.install();
  }

  private unmount(): void {
    this.app?.uninstall();
  }

  private update(): void {
    return undefined;
  }
}

Main.run();
