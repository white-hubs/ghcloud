import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";

export const authStore = {
  tenant: "",
  terminal: CubeTerminalEnum.BUSINESS,
  token: "",
};

export const initAuthStore = (auth: CubeAuth): void => {
  /** 宿主注入的 tenant 有时为数字企业编码，统一成字符串避免前端 .trim() 等报错 */
  authStore.tenant = auth.tenant == null ? "" : String(auth.tenant);
  authStore.token = auth.token == null ? "" : String(auth.token);
  if (auth.terminal != null && String(auth.terminal) !== "") {
    authStore.terminal = auth.terminal;
  }
};
