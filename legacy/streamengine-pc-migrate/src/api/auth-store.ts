import type { CubeAuth } from "@ghcloud/cube-iot-center-service";
import { CubeTerminalEnum } from "@ghcloud/cube-protocol";

export const authStore: CubeAuth = {
  tenant: "",
  terminal: CubeTerminalEnum.BUSINESS,
  token: "",
};

function readSessionAuth(): { tenant: string; token: string } {
  try {
    const tokenRaw = sessionStorage.getItem("GH-Token");
    const enterpriseRaw = sessionStorage.getItem("GH-NowEnterprise");
    const token = tokenRaw ? ((JSON.parse(tokenRaw) as { access_token?: string }).access_token ?? "") : "";
    const tenant = enterpriseRaw ? ((JSON.parse(enterpriseRaw) as { code?: string }).code ?? "") : "";
    return { tenant, token };
  } catch {
    return { tenant: "", token: "" };
  }
}

/** 有传入鉴权时优先使用；独立/iframe 打开时回退到 sessionStorage */
export const initAuthStore = (auth?: { tenant: string; token: string } | null): void => {
  if (auth?.tenant && auth?.token) {
    authStore.tenant = auth.tenant;
    authStore.token = auth.token;
    return;
  }
  const sessionAuth = readSessionAuth();
  authStore.tenant = sessionAuth.tenant;
  authStore.token = sessionAuth.token;
};
