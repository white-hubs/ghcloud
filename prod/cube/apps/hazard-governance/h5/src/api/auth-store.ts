import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";

export const authStore: CubeAuth = {
  tenant: "",
  terminal: CubeTerminalEnum.APP,
  token: "",
};

export const initAuthStore = (auth: CubeAuth): void => {
  authStore.tenant = auth.tenant;
  authStore.token = auth.token.replace(/^bearer\s+/i, "");
  authStore.terminal = auth.terminal ?? CubeTerminalEnum.APP;
};
