import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";

export const authStore: CubeAuth = {
  tenant: "",
  terminal: CubeTerminalEnum.BUSINESS,
  token: "",
};

export const initAuthStore = (auth: { tenant: string; token: string; terminal?: string }): void => {
  authStore.tenant = auth.tenant;
  authStore.token = auth.token;
  if (auth.terminal) {
    authStore.terminal = auth.terminal as CubeTerminalEnum;
  }
};
