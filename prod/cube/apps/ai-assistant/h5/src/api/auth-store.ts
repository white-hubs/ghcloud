import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";

export const authStore = {
  tenant: "",
  terminal: CubeTerminalEnum.APP,
  token: "",
};

export const initAuthStore = (auth: CubeAuth): void => {
  authStore.tenant = auth.tenant == null ? "" : String(auth.tenant);
  authStore.token = auth.token == null ? "" : String(auth.token);
  authStore.terminal = auth.terminal == null || String(auth.terminal) === "" ? CubeTerminalEnum.APP : auth.terminal;
};
