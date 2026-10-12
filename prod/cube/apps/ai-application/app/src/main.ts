import { ensureCryptoRandomUUIDPolyfill } from "./util/crypto-random-uuid";

ensureCryptoRandomUUIDPolyfill();

import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

import { initAuthStore } from "./api/auth-store";
import { Application } from "./app";
import { logger } from "./logger";

import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "./styles.less";

class Main {
  public static run(): void {
    new Main().init();
  }

  private app?: Application;

  public init(): void {
    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
      this.renderWithDefault();
      return;
    }
    this.renderWithQiankun();
  }

  private renderWithDefault(): void {
    this.app = new Application({ base: "/apps/ai-application" });
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
    this.app = new Application({ base: "/portal/ai-application", ...props });
    initAuthStore(props.auth);
    void this.app.install();
  }

  private unmount(): void {
    this.app?.uninstall();
  }

  private update(props: QiankunProps): void {
    logger.debug("update", props);
  }
}

Main.run();
