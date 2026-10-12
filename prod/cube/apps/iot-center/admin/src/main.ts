import { initAuthStore } from "./api/auth-store";
import { Application } from "./app";
import { logger } from "./logger";
import { apiProxy } from "@ghcloud/cube-app-design";
import { initGenericComponentAuth } from "@ghcloud/generic-component";
import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

class Main {
  public static run(): void {
    new Main().init();
  }

  private app?: Application;

  private constructor() {}

  public init(): void {
    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
      this.renderWithDefault();
      return;
    }

    this.renderWithQiankun();
  }

  private renderWithDefault(): void {
    this.app = new Application({});
    this.app.install();
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
    // TODO(danke): 子应用嵌入主应用被分配的基础路径，目前每个应用单独写死
    this.app = new Application({ base: "/portal/iot-center-admin", ...props });
    initAuthStore(props.auth);
    this.setCacheAuth(props.auth);
    apiProxy.updateAuth(props.auth);
    initGenericComponentAuth(props.auth);
    this.app.install();
  }

  private setCacheAuth(auth: { token: string; tenant: string }): void {
    sessionStorage.setItem("GH-Token", JSON.stringify({ access_token: auth.token }));
    sessionStorage.setItem("GH-NowEnterprise", JSON.stringify({ code: auth.tenant }));
    sessionStorage.setItem("GH-currentApplication", JSON.stringify({ code: "" }));
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
