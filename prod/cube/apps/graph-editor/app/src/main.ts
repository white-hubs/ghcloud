import { initAuthStore } from "./api/auth-store";
import { Application } from "./app";
import { AuthService } from "@ghcloud/cube-service";
import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

const appBasePath = "/portal/graph-editor";

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
    this.initCubeServiceAuth();
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

  private bootstrap(): Promise<void> {
    return Promise.resolve();
  }

  private async mount(props: QiankunProps): Promise<void> {
    this.app = new Application({ base: appBasePath, ...props });
    initAuthStore(props.auth);
    this.initCubeServiceAuth();
    await this.app.install();
  }

  private async unmount(_props: QiankunProps): Promise<void> {
    if (this.app) {
      await this.app.uninstall();
    }
  }

  private update(_props: QiankunProps): void {}

  private initCubeServiceAuth(): void {
    try {
      const tokenStr = sessionStorage.getItem("GH-Token");
      const appStr = sessionStorage.getItem("GH-NowEnterprise");
      if (!tokenStr || !appStr) {
        return;
      }
      enum TokenKey {
        ACCESSTOKEN = "access_token",
      }
      const token = JSON.parse(tokenStr) as Record<TokenKey, string>;
      const currentApplication = JSON.parse(appStr) as { code: string };
      AuthService.cacheAuth({
        authorization: token.access_token,
        tenant: currentApplication.code,
        userID: "",
      });
    } catch {
      // ignore
    }
  }
}

Main.run();
