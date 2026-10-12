import { initAuthStore as initAlarmCenterAuth } from "@ghcloud/cube-alarm-center-h5/src/api/auth-store.ts";
import { initAuthStore as initGenericComponentAuth } from "@ghcloud/cube-app-generic-component";
import { initCubePlayerAuth } from "@ghcloud/cube-player";
import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";
import { authRequest, DEV_MOCK_AUTH, type AuthState } from "@ghcloud/cube-services-client/auth-request";

export interface H5AuthState {
  tenant: string;
  terminal: CubeTerminalEnum;
  token: string;
}

export const authStore: H5AuthState = {
  tenant: "",
  terminal: CubeTerminalEnum.APP,
  token: "",
};

const normalizeToken = (token: string): string => token.replace(/^Bearer\s+/i, "").trim();

const toAuthRequestState = (auth: H5AuthState): AuthState => ({
  tenant: Number(auth.tenant) || DEV_MOCK_AUTH.tenant,
  terminal: auth.terminal,
  token: auth.token,
});

export const syncAuthStore = (auth: CubeAuth): void => {
  const normalized: H5AuthState = {
    tenant: auth.tenant,
    terminal: auth.terminal ?? CubeTerminalEnum.APP,
    token: normalizeToken(auth.token),
  };

  authStore.tenant = normalized.tenant;
  authStore.terminal = normalized.terminal;
  authStore.token = normalized.token;

  if (normalized.token) {
    sessionStorage.setItem("token", normalized.token);
    sessionStorage.setItem("GH-Token", JSON.stringify({ access_token: `Bearer ${normalized.token}` }));
  } else {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("GH-Token");
  }

  if (normalized.tenant) {
    sessionStorage.setItem("tenant", normalized.tenant);
    sessionStorage.setItem("GH-NowEnterprise", JSON.stringify({ code: normalized.tenant }));
  } else {
    sessionStorage.removeItem("tenant");
    sessionStorage.removeItem("GH-NowEnterprise");
  }

  authRequest.updateAuth(normalized.token ? toAuthRequestState(normalized) : DEV_MOCK_AUTH);
  initGenericComponentAuth({
    tenant: normalized.tenant,
    terminal: normalized.terminal,
    token: normalized.token,
  });
  initAlarmCenterAuth({
    tenant: normalized.tenant,
    terminal: normalized.terminal,
    token: normalized.token,
  });
  initCubePlayerAuth({
    tenant: normalized.tenant,
    terminal: normalized.terminal,
    token: normalized.token,
  });
};

export const clearAuthStore = (): void => {
  syncAuthStore({ token: "", tenant: "", terminal: CubeTerminalEnum.APP });
};
