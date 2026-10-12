import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

import { getConfigList } from "@ghcloud/cube-business-alias-manage-plugin";
import { initGenericComponentAuth } from "@ghcloud/generic-component";

import { Application } from "./app";
import { initAuthStore } from "@/api/auth-store";

declare const __PUBLIC_PATH__: string;

const DEFAULT_QIANKUN_BASE = "/portal/personalManagement/";

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
    this.app = new Application({
      base: import.meta.env.BASE_URL || __PUBLIC_PATH__,
    });
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

  private bootstrap(): void {}

  private async mount(props: QiankunProps): Promise<void> {
    initAuthStore(props.auth);
    initGenericComponentAuth(props.auth);
    await getConfigList(props.auth);
    this.app = new Application({
      ...props,
      base: props.base ?? DEFAULT_QIANKUN_BASE,
    });
    await this.app.install();
  }

  private unmount(): void {
    void this.app?.uninstall();
    this.app = undefined;
  }

  private update(): void {}
}

Main.run();
