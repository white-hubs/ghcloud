import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

import { authRequest, DEV_MOCK_AUTH, type AuthState } from "@ghcloud/cube-services-client/auth-request";

import { Application } from "./app";
import { ensureApplicationSessionContext } from "./bootstrap/ensure-application-session";
import { logger } from "./logger";

const QIANKUN_APP_BASE = "/portal/grain-storage-cockpit";
const STANDALONE_APP_BASE = "/grain-storage-cockpit";

class Main {
  private app: Application | undefined;

  public static run(): void {
    const main = new Main();
    if (qiankunWindow.__POWERED_BY_QIANKUN__) {
      main.registerQiankunLifecycles();
      return;
    }
    void main.mountApp().catch((error: unknown) => {
      logger.error("standalone mount failed", error);
    });
  }

  private registerQiankunLifecycles(): void {
    renderWithQiankun({
      bootstrap: async () => {
        logger.debug("bootstrap");
      },
      mount: async (props) => {
        await this.mountApp(props);
      },
      unmount: async () => {
        this.app?.uninstall();
        this.app = undefined;
      },
      update: async (props) => {
        logger.debug("update", props);
      },
    });
  }

  private async mountApp(props?: QiankunProps): Promise<void> {
    ensureApplicationSessionContext();
    const auth = (props as { auth?: AuthState } | undefined)?.auth ?? DEV_MOCK_AUTH;
    authRequest.updateAuth(auth);
    const base = qiankunWindow.__POWERED_BY_QIANKUN__ ? QIANKUN_APP_BASE : STANDALONE_APP_BASE;
    this.app = new Application({ base, ...props });
    await this.app.install();
  }
}

Main.run();
