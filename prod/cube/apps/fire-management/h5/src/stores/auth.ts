import { initAuthStore as initGenericComponentAuth } from "@ghcloud/cube-app-generic-component";
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
  } else {
    sessionStorage.removeItem("token");
  }

  if (normalized.tenant) {
    sessionStorage.setItem("tenant", normalized.tenant);
  } else {
    sessionStorage.removeItem("tenant");
  }

  authRequest.updateAuth(normalized.token ? toAuthRequestState(normalized) : DEV_MOCK_AUTH);
  initGenericComponentAuth({
    tenant: normalized.tenant,
    terminal: normalized.terminal,
    token: normalized.token,
  });
};

export const clearAuthStore = (): void => {
  syncAuthStore({ token: "", tenant: "", terminal: CubeTerminalEnum.APP });
};
