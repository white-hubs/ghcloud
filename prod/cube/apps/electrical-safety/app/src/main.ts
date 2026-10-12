import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

import { addGatewayErrorInterceptor, resolveGatewayErrorMessage } from "@ghcloud/cube-gateway";
import { initCubePlayerAuth } from "@ghcloud/cube-player";
import { authRequest, DEV_MOCK_AUTH, type AuthState } from "@ghcloud/cube-services-client/auth-request";
import { message } from "@ghcloud/cube-ui";

import { initAuthStore } from "./api/auth-store";
import { Application } from "./app";
import { ensureApplicationSessionContext } from "./bootstrap/ensure-application-session";
import { logger } from "./logger";

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
  public static run(): void {
    new Main().init();
  }

  private app?: Application;
  private removeGatewayErrorInterceptor?: () => void;

  private init(): void {
    if (qiankunWindow.__POWERED_BY_QIANKUN__) {
      this.renderWithQiankun();
      return;
    }
    this.renderWithDefault();
  }

  private renderWithDefault(): void {
    // 独立运行（非 qiankun）没有主应用下发真实鉴权，用占位 auth 让 useAuthRequest 不抛
    ensureApplicationSessionContext({ tenantCode: DEV_MOCK_AUTH.tenant });
    authRequest.updateAuth(DEV_MOCK_AUTH);
    initAuthStore(DEV_MOCK_AUTH);
    this.syncCubePlayerAuth(DEV_MOCK_AUTH);
    this.installGatewayErrorInterceptor();
    // 独立运行使用 Vite 的部署基址，刷新 `/apps/.../<route>` 时仍由子应用路由接管。
    this.app = new Application({ base: import.meta.env.BASE_URL });
    void this.app.install();
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
    const { auth } = props as { auth: AuthState };
    authRequest.updateAuth(auth);
    initAuthStore(auth);
    this.syncCubePlayerAuth(auth);
    this.installGatewayErrorInterceptor();
    // qiankun 子应用的基础路径由主应用分配，须与 vite.config.ts 的 projectName、index.html 的 #ElectricalSafety 保持一致
    this.app = new Application({ base: "/portal/electrical-safety", ...props });
    void this.app.install();
  }

  private unmount(props: QiankunProps): void {
    logger.debug("unmount", props);
    this.app?.uninstall();
    this.removeGatewayErrorInterceptor?.();
    this.removeGatewayErrorInterceptor = undefined;
  }

  private installGatewayErrorInterceptor(): void {
    this.removeGatewayErrorInterceptor?.();
    this.removeGatewayErrorInterceptor = addGatewayErrorInterceptor((event) => {
      message.error(resolveGatewayErrorMessage(event));
    });
  }

  private syncCubePlayerAuth(auth: AuthState): void {
    initCubePlayerAuth({
      tenant: String(auth.tenant),
      token: auth.token.replace(/^Bearer\s+/i, "").trim(),
      terminal: auth.terminal,
    });
  }

  private update(props: QiankunProps): void {
    logger.debug("update", props);
  }
}

Main.run();
