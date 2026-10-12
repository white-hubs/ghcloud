import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

import { Application } from "./application";

const appBasePath = "/portal/scada-studio";

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
    this.app.install().catch((error) => {
      console.error("[ScadaStudio] bootstrap failed:", error);
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

  private bootstrap(): Promise<void> {
    return Promise.resolve();
  }

  private async mount(props: QiankunProps): Promise<void> {
    this.app = new Application({ base: appBasePath, ...props });
    await this.app.install();
  }

  private async unmount(): Promise<void> {
    if (this.app) {
      await this.app.uninstall();
    }
  }

  private update(_props: QiankunProps): void {}
}

Main.run();
