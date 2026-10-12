import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";

export const authStore: CubeAuth = {
  tenant: "",
  terminal: CubeTerminalEnum.VISUALIZATION,
  token: "",
};

export const initAuthStore = (auth: CubeAuth): void => {
  authStore.token = auth.token;
  authStore.tenant = auth.tenant;
  authStore.terminal = auth.terminal || CubeTerminalEnum.VISUALIZATION;
};

export const getAuthStore = (): CubeAuth => ({ ...authStore });
