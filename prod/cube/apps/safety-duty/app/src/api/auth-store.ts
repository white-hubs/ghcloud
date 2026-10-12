import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";

export const authStore: CubeAuth = {
  tenant: "",
  terminal: CubeTerminalEnum.BUSINESS,
  token: "",
};

export const initAuthStore = (auth: { tenant?: string | number; token?: string; terminal?: CubeTerminalEnum }): void => {
  authStore.tenant = String(auth.tenant ?? "");
  authStore.token = (auth.token ?? "").replace(/^Bearer\s+/i, "").trim();
  authStore.terminal = auth.terminal ?? CubeTerminalEnum.BUSINESS;
};
