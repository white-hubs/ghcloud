import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

import { apiProxy } from "@ghcloud/cube-app-design";
import { initCubePlayerAuth } from "@ghcloud/cube-player";
import { authRequest, type AuthState } from "@ghcloud/cube-services-client/auth-request";

import { Application } from "./app";
import { ensureApplicationSessionContext } from "./bootstrap/ensure-application-session";
import { readSessionAuth } from "./bootstrap/read-session-auth";
import { logger } from "./logger";

import "./assets/font-awesome.css";

/**
 * 子应用入口。
 *
 * - qiankun 模式下由主应用调用生命周期 bootstrap/mount/unmount/update
 * - 独立运行（非 qiankun）用 `renderWithDefault` 直接起一份，方便本地调试
 *
 * 注意：
 * - 仅在 mount 时调用 `authRequest.updateAuth(props.auth)`，业务层不要直接操作 authRequest
 */
class Main {
  private static readonly MODAL_SCOPE_CLASS = "fire-management-modal-scope";
  private static readonly DEFAULT_TERMINAL = "bimops-manage-web" as AuthState["terminal"];

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
    document.body.classList.add(Main.MODAL_SCOPE_CLASS);
    const sessionAuth = readSessionAuth();
    if (sessionAuth?.token) {
      this.initAuth(sessionAuth);
    } else {
      ensureApplicationSessionContext();
      logger.warn("[fire-management] 未读取到真实会话；独立运行时请先完成主应用登录后再访问。");
    }
    this.app = new Application({});
    void this.app.install();
  }

  private initAuth(auth: AuthState): void {
    const normalizedAuth: AuthState = {
      tenant: auth.tenant,
      terminal: auth.terminal || Main.DEFAULT_TERMINAL,
      token: auth.token.replace(/^Bearer\s+/i, "").trim(),
    };
    ensureApplicationSessionContext({ tenantCode: normalizedAuth.tenant });
    authRequest.updateAuth(normalizedAuth);
    apiProxy.updateAuth(normalizedAuth);
    initCubePlayerAuth(normalizedAuth as any);
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
    document.body.classList.add(Main.MODAL_SCOPE_CLASS);
    const { auth } = props as { auth?: AuthState };
    const resolvedAuth = auth?.token ? auth : readSessionAuth();
    if (resolvedAuth?.token) {
      this.initAuth(resolvedAuth);
    } else {
      ensureApplicationSessionContext();
      logger.warn("[fire-management] 未收到真实鉴权信息；请由主应用通过 props.auth 注入。");
    }
    // qiankun 子应用的基础路径由主应用分配，须与 vite.config.ts 的 projectName、index.html 的 #FireManagement 保持一致
    this.app = new Application({ base: "/portal/fire-management", ...props });
    void this.app.install();
  }

  private unmount(props: QiankunProps): void {
    logger.debug("unmount", props);
    this.app?.uninstall();
    document.body.classList.remove(Main.MODAL_SCOPE_CLASS);
  }

  private update(props: QiankunProps): void {
    logger.debug("update", props);
  }
}

Main.run();
