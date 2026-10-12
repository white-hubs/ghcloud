import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

import { authRequest, type AuthState } from "@ghcloud/cube-services-client/auth-request";
import { initGenericComponentAuth } from "@ghcloud/generic-component";

import { initAuthStore } from "./api/auth-store";
import { Application } from "./app";
import { logger } from "./logger";

/**
 * 子应用入口。
 *
 * 仅由主应用通过 qiankun 调用生命周期。
 * 鉴权只在 mount 时通过主应用下发的 props.auth 初始化。
 */
class Main {
  public static run(): void {
    new Main().init();
  }

  private app?: Application;

  private init(): void {
    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
      logger.warn("[emergency-supplies] must run inside the main application");
      return;
    }

    this.renderWithQiankun();
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
    initAuthStore(auth);
    initGenericComponentAuth(auth);
    authRequest.updateAuth(auth);
    // qiankun 子应用的基础路径由主应用分配，须与 vite.config.ts 的 projectName、index.html 的 #EmergencySupplies 保持一致
    this.app = new Application({
      base: "/portal/emergency-supplies",
      ...props,
    });
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
