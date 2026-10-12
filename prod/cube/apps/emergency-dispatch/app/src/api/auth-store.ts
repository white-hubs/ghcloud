import type { CubeAuth } from "@ghcloud/cube-gateway";
import { CubeTerminalEnum } from "@ghcloud/cube-protocol";
import type { AuthState } from "@ghcloud/cube-services-client/auth-request";

export const authStore: CubeAuth = {
  tenant: "",
  terminal: CubeTerminalEnum.BUSINESS,
  token: "",
};

export const initAuthStore = (auth: AuthState): void => {
  authStore.tenant = String(auth.tenant);
  authStore.terminal = auth.terminal || CubeTerminalEnum.BUSINESS;
  authStore.token = auth.token;
};
