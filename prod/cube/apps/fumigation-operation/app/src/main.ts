import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

import { initCubePlayerAuth } from "@ghcloud/cube-player";
import { authRequest, DEV_MOCK_AUTH, type AuthState } from "@ghcloud/cube-services-client/auth-request";

import { Application } from "./app";
import { ensureApplicationSessionContext } from "./bootstrap/ensure-application-session";
import { readSessionAuth } from "./bootstrap/read-session-auth";
import { APP_ROUTE_PREFIX } from "./constants/env";
import { logger } from "./logger";

/**
 * 子应用入口。
 *
 * - qiankun 模式下由主应用调用生命周期 bootstrap/mount/unmount/update
 * - 独立运行（非 qiankun）用 `renderWithDefault` 直接起一份，方便本地调试
 *
 * 注意：
 * - mount 内必须先同步注册 qiankun 生命周期，不能被 mock / 鉴权异步阻塞
 * - auth 优先用 props.auth，其次 sessionStorage；cube-app-design 组件读 sessionStorage
 */
class Main {
  public static run(): void {
    new Main().init();
  }

  private app?: Application;

  private init(): void {
    if (qiankunWindow.__POWERED_BY_QIANKUN__) {
      this.renderWithQiankun();
      return;
    }

    void this.renderWithDefault();
  }

  private async renderWithDefault(): Promise<void> {
    if (__ENV__.mock) {
      const { setupMocks } = await import("./mocks");
      setupMocks();
      logger.info("[fumigation-operation] mock mode enabled");
    }

    const sessionAuth = readSessionAuth();
    if (sessionAuth?.token) {
      this.initAuth(sessionAuth);
    } else {
      ensureApplicationSessionContext({ tenantCode: DEV_MOCK_AUTH.tenant });
      authRequest.updateAuth(DEV_MOCK_AUTH);
      this.syncCubePlayerAuth(DEV_MOCK_AUTH);
    }

    this.app = new Application({ base: location.pathname.startsWith(APP_ROUTE_PREFIX) ? APP_ROUTE_PREFIX : "" });
    void this.app.install();
  }

  private initAuth(auth: AuthState): void {
    const normalizedAuth: AuthState = {
      tenant: Number(auth.tenant) || 0,
      terminal: auth.terminal || DEV_MOCK_AUTH.terminal,
      token: auth.token.replace(/^Bearer\s+/i, "").trim(),
    };
    ensureApplicationSessionContext({ tenantCode: normalizedAuth.tenant });
    authRequest.updateAuth(normalizedAuth);
    sessionStorage.setItem("GH-Token", JSON.stringify({ access_token: normalizedAuth.token }));
    sessionStorage.setItem("GH-NowEnterprise", JSON.stringify({ code: String(normalizedAuth.tenant) }));
    this.syncCubePlayerAuth(normalizedAuth);
  }

  private syncCubePlayerAuth(auth: AuthState): void {
    initCubePlayerAuth({
      tenant: String(auth.tenant),
      token: auth.token.replace(/^Bearer\s+/i, "").trim(),
      terminal: auth.terminal,
    });
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
    logger.debug("bootstrap");
  }

  private mount(props: QiankunProps): void {
    logger.debug("mount", props);

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
        this.syncCubePlayerAuth(DEV_MOCK_AUTH);
      }
    }

    this.app = new Application({ ...props, base: APP_ROUTE_PREFIX });
    void this.app.install();
  }

  private unmount(props: QiankunProps): void {
    logger.debug("unmount", props);
    this.app?.uninstall();
  }

  private update(props: QiankunProps): void {
    logger.debug("update", props);
  }
}

Main.run();
