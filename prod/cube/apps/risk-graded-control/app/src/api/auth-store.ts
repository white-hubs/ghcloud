import type { CubeAuth } from "@ghcloud/cube-gateway";
import { CubeTerminalEnum } from "@ghcloud/cube-protocol";

export const authStore: CubeAuth = {
  tenant: "",
  terminal: CubeTerminalEnum.BUSINESS,
  token: "",
};

export const initAuthStore = (auth: { tenant: string; token: string }): void => {
  authStore.tenant = auth.tenant;
  authStore.token = auth.token;
};
