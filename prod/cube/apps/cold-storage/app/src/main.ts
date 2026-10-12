import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

import { initCubePlayerAuth } from "@ghcloud/cube-player";
import { authRequest, DEV_MOCK_AUTH, type AuthState } from "@ghcloud/cube-services-client/auth-request";

import { initAuthStore } from "./api/auth-store";
import { Application } from "./app";
import { ensureApplicationSessionContext } from "./bootstrap/ensure-application-session";
import { readSessionAuth } from "./bootstrap/read-session-auth";
import { APP_ROUTE_PREFIX } from "./constants/env";

class Main {
  private app?: Application;

  public static run(): void {
    void new Main().init();
  }

  private async init(): Promise<void> {
    if (qiankunWindow.__POWERED_BY_QIANKUN__) {
      this.renderWithQiankun();
      return;
    }

    if (__ENV__.mock) {
      const { setupMocks } = await import("./mocks");
      setupMocks();
    }
    this.renderWithDefault();
  }

  private renderWithDefault(): void {
    const sessionAuth = readSessionAuth();
    if (sessionAuth?.token) {
      this.initAuth(sessionAuth);
    } else {
      ensureApplicationSessionContext({ tenantCode: DEV_MOCK_AUTH.tenant });
      authRequest.updateAuth(DEV_MOCK_AUTH);
      initAuthStore(DEV_MOCK_AUTH);
      initCubePlayerAuth(DEV_MOCK_AUTH);
    }
    const base = location.pathname.startsWith(APP_ROUTE_PREFIX) ? APP_ROUTE_PREFIX : "";
    this.app = new Application({ base });
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
    initAuthStore(normalizedAuth);
    initCubePlayerAuth(normalizedAuth);
  }

  private renderWithQiankun(): void {
    renderWithQiankun({
      bootstrap: () => undefined,
      mount: (props: QiankunProps) => {
        const propsAuth = (props as QiankunProps & { auth?: AuthState }).auth;
        if (propsAuth?.token) {
          this.initAuth(propsAuth);
        } else {
          const sessionAuth = readSessionAuth();
          if (sessionAuth?.token) {
            this.initAuth(sessionAuth);
          } else {
            ensureApplicationSessionContext({ tenantCode: DEV_MOCK_AUTH.tenant });
            authRequest.updateAuth(DEV_MOCK_AUTH);
            initAuthStore(DEV_MOCK_AUTH);
            initCubePlayerAuth(DEV_MOCK_AUTH);
          }
        }
        this.app = new Application({ ...props, base: APP_ROUTE_PREFIX });
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
