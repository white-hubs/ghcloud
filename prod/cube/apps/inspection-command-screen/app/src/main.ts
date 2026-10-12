import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";

import { getAuthInfo, setAuthInfo } from "@ghcloud/cube-auth-utils";
import { initCubePlayerAuth } from "@ghcloud/cube-player";
import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";
import { initGenericComponentAuth } from "@ghcloud/generic-component";

import { initAuthStore } from "./api/auth-store";
import { getSessionAuth, persistAuthSession, syncAuthFromUrl } from "./api/session";
import { Application } from "./app";

const qiankunAppBase = "/portal/inspection-command-screen";
const standaloneAppBase = "/inspection-command-screen";

const defaultAuth = (): CubeAuth => ({
  token: "",
  tenant: "",
  terminal: CubeTerminalEnum.BUSINESS,
});

const normalizeAuth = (auth?: Partial<CubeAuth>): CubeAuth => ({
  token: auth?.token || "",
  tenant: auth?.tenant || "",
  terminal: auth?.terminal || CubeTerminalEnum.BUSINESS,
});

const bootstrapAuth = async (props?: QiankunProps): Promise<CubeAuth> => {
  try {
    await syncAuthFromUrl();
  } catch {}

  let auth = normalizeAuth((props as { auth?: Partial<CubeAuth> } | undefined)?.auth);
  if (!auth.token) {
    try {
      auth = normalizeAuth((await getAuthInfo()) as CubeAuth);
    } catch {
      auth = defaultAuth();
    }
  }

  if (!auth.token || !auth.tenant) {
    const sessionAuth = getSessionAuth();
    if (sessionAuth.token && sessionAuth.tenant) {
      auth = sessionAuth;
    }
  }

  if (auth.token && auth.tenant) {
    auth = persistAuthSession(auth);
  } else {
    setAuthInfo(auth);
    initAuthStore(auth);
  }

  initGenericComponentAuth(auth);
  initCubePlayerAuth(auth);
  return auth;
};

class Main {
  private app?: Application;

  private async mountApp(props?: QiankunProps): Promise<void> {
    const auth = await bootstrapAuth(props);
    const base = qiankunWindow.__POWERED_BY_QIANKUN__ ? qiankunAppBase : standaloneAppBase;
    this.app = new Application({ base, auth });
    this.app.install();
  }

  public run(): void {
    renderWithQiankun({
      bootstrap: async () => {},
      mount: async (props) => {
        await this.mountApp(props);
      },
      unmount: async () => {
        await this.app?.uninstall();
      },
      update: async () => {},
    });

    if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
      this.mountApp().catch((error) => {
        console.error("[inspection-command-screen] mount failed", error);
      });
    }
  }
}

new Main().run();
