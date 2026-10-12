import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

import { authRequest, DEV_MOCK_AUTH, type AuthState } from "@ghcloud/cube-services-client/auth-request";

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
 * - dev 默认启用 mock（见 vite.config.ts 的 `__ENV__.mock`），业务 fetch 调用会被拦截
 */
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
    if (__ENV__.mock) {
      const { setupMocks } = await import("./mocks");
      setupMocks();
      logger.info("[intelligent-grain] mock mode enabled");
    }

    // 独立运行（非 qiankun）没有主应用下发真实鉴权，用占位 auth 让 useAuthRequest 不抛
    // 实际请求由 mock 覆盖，占位 token 不会到达真实后端
    ensureApplicationSessionContext({ tenantCode: DEV_MOCK_AUTH.tenant });
    authRequest.updateAuth(DEV_MOCK_AUTH);
    this.app = new Application({});
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
    ensureApplicationSessionContext({ tenantCode: auth.tenant, overwriteTenant: true });
    authRequest.updateAuth(auth);
    // qiankun 子应用的基础路径由主应用分配，须与 vite.config.ts 的 projectName、index.html 的 #IntelligentGrain 保持一致
    this.app = new Application({ base: "/portal/intelligent-grain", ...props });
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
