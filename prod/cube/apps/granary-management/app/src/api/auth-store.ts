import type { Router } from "vue-router";

import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";

export const authStore = {
  tenant: "",
  terminal: CubeTerminalEnum.BUSINESS,
  token: "",
};

export const initAuthStore = (auth: CubeAuth): void => {
  authStore.tenant = auth.tenant;
  authStore.token = auth.token;
  authStore.terminal = auth.terminal ?? CubeTerminalEnum.BUSINESS;
};

let hostMainRouter: Router | undefined;

/** qiankun 挂载时由 Application 注入宿主 Router，仅用于跳主应用 `/index` */
export function registerHostMainRouter(router: Router | undefined): void {
  hostMainRouter = router;
}

/**
 * 回到主应用 `/index`。
 */
export function navigateToMainApplicationIndex(): void {
  if (hostMainRouter != null) {
    void hostMainRouter.replace({ path: "/index" });
    return;
  }

  globalThis.location.assign(`${globalThis.location.origin}/index`);
}

/** qiankun 内跳宿主任意 path（如 `/portal/xxx/`）；独立打开时整页跳转 */
export function navigateHostReplacePath(path: string): void {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (hostMainRouter != null) {
    void hostMainRouter.replace({ path: normalized });
    return;
  }
  globalThis.location.assign(`${globalThis.location.origin}${normalized}`);
}
