import { CubeAuthService } from "@ghcloud/cube-auth-service";
import { setAuthInfo } from "@ghcloud/cube-auth-utils";
import { initCubePlayerAuth } from "@ghcloud/cube-player";
import { BASE_API, CubeHeaders, CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";

import { initAuthStore } from "./auth-store";

const tokenKey = "GH-Token";
const tenantKey = "GH-NowEnterprise";
const authService = new CubeAuthService(CubeTerminalEnum.BUSINESS);
const cubeSecretParamKey = "cube-secret";

const normalizeAuth = (auth: Partial<CubeAuth>): CubeAuth => ({
  token: auth.token || "",
  tenant: auth.tenant || "",
  terminal: auth.terminal || CubeTerminalEnum.BUSINESS,
});

const safeJsonParse = (value: string): Record<string, unknown> => {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const readSessionToken = (): string => {
  return String(safeJsonParse(sessionStorage.getItem(tokenKey) || "{}").access_token || "");
};

const readSessionTenant = (): string => {
  return String(safeJsonParse(sessionStorage.getItem(tenantKey) || "{}").code || "");
};

const parseNowEnterpriseTenant = (value: string | null): string => {
  if (!value) {
    return "";
  }
  const parsed = safeJsonParse(value);
  const parsedTenant = String(parsed.code || parsed.id || "");
  if (parsedTenant) {
    return parsedTenant;
  }
  return value.includes("{") ? "" : value;
};

const writeTokenSession = (token: string, refreshToken = "", expiresIn?: number): void => {
  const tokenInfo: Record<string, string | number> = {
    access_token: token,
    token_type: "bearer",
  };
  if (refreshToken) {
    tokenInfo.refresh_token = refreshToken;
  }
  if (typeof expiresIn === "number") {
    tokenInfo.expires_in = expiresIn;
  }
  sessionStorage.setItem(tokenKey, JSON.stringify(tokenInfo));
};

const writeTenantSession = (tenant: string): void => {
  sessionStorage.setItem(tenantKey, JSON.stringify({ code: tenant }));
};

export const persistAuthSession = (auth: Partial<CubeAuth>): CubeAuth => {
  const nextAuth = normalizeAuth(auth);
  if (nextAuth.token) {
    writeTokenSession(nextAuth.token);
  }
  if (nextAuth.tenant) {
    writeTenantSession(nextAuth.tenant);
  }
  setAuthInfo(nextAuth);
  initAuthStore(nextAuth);
  initCubePlayerAuth(nextAuth);
  return nextAuth;
};

export const getSessionAuth = (): CubeAuth => {
  return normalizeAuth({
    token: readSessionToken(),
    tenant: readSessionTenant(),
    terminal: CubeTerminalEnum.BUSINESS,
  });
};

const decodeJwtPayload = (token: string): Record<string, unknown> => {
  try {
    const payload = token.split(".")[1] || "";
    const text = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(text))) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const removeCubeSecretFromUrl = (url: URL): void => {
  if (!url.searchParams.has(cubeSecretParamKey)) {
    return;
  }
  url.searchParams.delete(cubeSecretParamKey);
  window.history.replaceState(window.history.state, document.title, `${url.pathname}${url.search}${url.hash}`);
};

export const syncSessionFromUrlAccessToken = (): void => {
  const url = new URL(window.location.href);
  const token = url.searchParams.get("access_token");
  if (!token) {
    return;
  }
  const tenant = url.searchParams.get("tenant") || parseNowEnterpriseTenant(url.searchParams.get("nowEnterprise"));
  writeTokenSession(token);
  if (tenant) {
    persistAuthSession({ token, tenant, terminal: CubeTerminalEnum.BUSINESS });
  }
};

export const syncAuthFromUrl = async (): Promise<CubeAuth | null> => {
  const url = new URL(window.location.href);
  const token = url.searchParams.get("access_token");
  if (token) {
    const tenant = url.searchParams.get("tenant") || parseNowEnterpriseTenant(url.searchParams.get("nowEnterprise"));
    writeTokenSession(token);
    if (tenant) {
      return persistAuthSession({ token, tenant, terminal: CubeTerminalEnum.BUSINESS });
    }
    return getSessionAuth();
  }

  const cubeSecret = url.searchParams.get(cubeSecretParamKey);
  if (!cubeSecret) {
    return null;
  }
  const tokenInfo = await authService.getTokenBySecret(cubeSecret);
  const terminal = (tokenInfo.terminal as CubeTerminalEnum) || CubeTerminalEnum.BUSINESS;
  writeTokenSession(tokenInfo.accessToken, tokenInfo.refreshToken, tokenInfo.expires_in);
  const auth = persistAuthSession({
    token: tokenInfo.accessToken,
    tenant: tokenInfo.tenant,
    terminal,
  });
  removeCubeSecretFromUrl(url);
  return auth;
};

export const hasSessionToken = (): boolean => {
  return Boolean(readSessionToken());
};

export const hasAuthSession = (): boolean => {
  const auth = getSessionAuth();
  return Boolean(auth.token && auth.tenant);
};

export const clearAuthSession = (): void => {
  sessionStorage.removeItem(tokenKey);
  sessionStorage.removeItem(tenantKey);
  setAuthInfo(normalizeAuth({}));
  initAuthStore(normalizeAuth({}));
  initCubePlayerAuth(normalizeAuth({}));
};

export const logout = (): void => {
  clearAuthSession();
  window.location.href = window.location.pathname;
};

export interface LoginPayload {
  username: string;
  password: string;
  code: string;
  key: string;
}

export interface TenantOption {
  code: string;
  name: string;
}

export const fetchLoginCode = async (): Promise<{ code: string; key: string }> => {
  return authService.getCode();
};

const fetchTenantOptions = async (token: string, fallbackTenants: string[]): Promise<TenantOption[]> => {
  try {
    const resp = await fetch(`${BASE_API}/mdata/tenants`, {
      headers: {
        [CubeHeaders.AUTHORIZATION]: `Bearer ${token}`,
        [CubeHeaders.TERMINAL]: CubeTerminalEnum.BUSINESS,
      },
    });
    if (!resp.ok) {
      throw new Error("fetch tenants failed");
    }
    const raw = (await resp.json()) as unknown;
    const list = Array.isArray(raw) ? raw : (raw as { data?: unknown })?.data;
    if (Array.isArray(list)) {
      const mapped = list
        .map((item) => item as Record<string, unknown>)
        .map((item) => ({
          code: String(item.code ?? item.id ?? ""),
          name: String(item.name ?? item.code ?? item.id ?? ""),
        }))
        .filter((item) => item.code !== "" && item.code !== "0" && item.name.trim() !== "0租户");
      if (mapped.length > 0) {
        return mapped;
      }
    }
  } catch {}
  return fallbackTenants.map((code) => ({ code, name: `企业 ${code}` }));
};

export const setTenantSession = (tenantCode: string): void => {
  persistAuthSession({
    token: readSessionToken(),
    tenant: tenantCode,
    terminal: CubeTerminalEnum.BUSINESS,
  });
};

export const getSessionTenantOptions = async (): Promise<TenantOption[]> => {
  const token = readSessionToken();
  if (!token) {
    return [];
  }
  const decoded = decodeJwtPayload(token);
  const tenants = Array.isArray(decoded.tenants) ? decoded.tenants : [];
  const tenantCodes = tenants.map((item) => String(item)).filter((item) => item !== "");
  return fetchTenantOptions(token, tenantCodes);
};

export const loginByMainMode = async (payload: LoginPayload): Promise<{ tenants: TenantOption[] }> => {
  const tokenInfo = await authService.getToken({
    username: payload.username,
    password: payload.password,
    key: payload.key,
    code: payload.code,
  });
  persistAuthSession({
    token: tokenInfo.accessToken,
    terminal: CubeTerminalEnum.BUSINESS,
  });
  const decoded = decodeJwtPayload(tokenInfo.accessToken);
  const tenants = Array.isArray(decoded.tenants) ? decoded.tenants : [];
  const tenantCodes = tenants.map((item) => String(item)).filter((item) => item !== "");
  const tenantOptions = await fetchTenantOptions(tokenInfo.accessToken, tenantCodes.length > 0 ? tenantCodes : tokenInfo.tenantIDs);
  return {
    tenants: tenantOptions,
  };
};
