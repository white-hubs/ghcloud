import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";

export const authStore: CubeAuth = {
  tenant: "",
  terminal: CubeTerminalEnum.APP,
  token: "",
};

export const initAuthStore = (auth: { tenant: number | string; terminal?: CubeTerminalEnum; token: string }): void => {
  authStore.tenant = String(auth.tenant);
  authStore.token = auth.token.replace(/^Bearer\s+/i, "").trim();
  authStore.terminal = auth.terminal ?? CubeTerminalEnum.APP;
};
