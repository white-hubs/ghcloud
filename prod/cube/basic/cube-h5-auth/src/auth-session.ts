export interface AuthInfo {
  token: string;
  tenant: string;
  terminal?: string;
}

export interface AuthLoginResult {
  token: string;
  tenant: string;
  terminal?: string;
}

export interface AuthRuntime {
  login?: (userName: string, password: string) => Promise<AuthLoginResult>;
  version?: string;
}

export interface AuthSessionConfig {
  tokenStorageKey?: string;
  tenantStorageKey?: string;
  redirectStorageKey?: string;
  defaultRedirectPath?: string;
  getToken?: () => string;
  isInApp?: () => boolean;
  onAuthChanged?: (authInfo: AuthInfo) => void;
  onAuthCleared?: () => void;
  runtimeUrl?: string;
  runtimeProvider?: () => Promise<AuthRuntime>;
  /** 登录页是否展示「游客进入」；默认 true。不支持访客业务的宿主可设为 false */
  showGuestEnter?: boolean;
}

const config: Required<Pick<AuthSessionConfig, "tokenStorageKey" | "tenantStorageKey" | "redirectStorageKey" | "defaultRedirectPath" | "showGuestEnter">> &
  Omit<AuthSessionConfig, "tokenStorageKey" | "tenantStorageKey" | "redirectStorageKey" | "defaultRedirectPath" | "showGuestEnter"> = {
  tokenStorageKey: "GH-Token",
  tenantStorageKey: "GH-NowEnterprise",
  redirectStorageKey: "cube_h5_auth_redirect",
  defaultRedirectPath: "/",
  showGuestEnter: true,
  getToken: undefined,
  isInApp: undefined,
  onAuthChanged: undefined,
  onAuthCleared: undefined,
  runtimeUrl: undefined,
  runtimeProvider: undefined,
};

let runtimeCache: AuthRuntime | null = null;
const GUEST_MODE_KEY = "cube_h5_auth_guest_mode";

const normalizeToken = (token: string): string => (token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`);
const toAuthStoreToken = (token: string): string => token.replace(/^bearer\s+/i, "");

const getTokenFromSession = (): string => {
  const tokenString = sessionStorage.getItem(config.tokenStorageKey);
  if (!tokenString) {
    return "";
  }
  try {
    const tokenData = JSON.parse(tokenString) as { access_token?: string };
    return tokenData.access_token ?? "";
  } catch (_ignore) {
    return "";
  }
};

export const authSession = {
  setup: (sessionConfig: AuthSessionConfig): void => {
    Object.assign(config, sessionConfig);
    runtimeCache = null;
  },
  getConfig: (): AuthSessionConfig => ({ ...config }),
  hasToken: (): boolean => {
    if (config.getToken) {
      return Boolean(config.getToken());
    }
    return Boolean(getTokenFromSession());
  },
  isInApp: (): boolean => config.isInApp?.() ?? false,
  saveAuthInfo: (authInfo: AuthInfo): void => {
    const normalizedToken = normalizeToken(authInfo.token);
    sessionStorage.removeItem(GUEST_MODE_KEY);
    sessionStorage.setItem(config.tokenStorageKey, JSON.stringify({ access_token: normalizedToken }));
    sessionStorage.setItem(config.tenantStorageKey, JSON.stringify({ code: authInfo.tenant }));
    config.onAuthChanged?.({ ...authInfo, token: toAuthStoreToken(authInfo.token) });
  },
  clearAuthInfo: (): void => {
    sessionStorage.removeItem(config.tokenStorageKey);
    sessionStorage.removeItem(config.tenantStorageKey);
    config.onAuthCleared?.();
  },
  saveRedirectFullPath: (fullPath: string): void => {
    sessionStorage.setItem(config.redirectStorageKey, fullPath);
  },
  consumeRedirectFullPath: (): string => {
    const redirect = sessionStorage.getItem(config.redirectStorageKey) ?? "";
    sessionStorage.removeItem(config.redirectStorageKey);
    return redirect;
  },
  enableGuestMode: (): void => {
    sessionStorage.setItem(GUEST_MODE_KEY, "1");
  },
  clearGuestMode: (): void => {
    sessionStorage.removeItem(GUEST_MODE_KEY);
  },
  isGuestMode: (): boolean => sessionStorage.getItem(GUEST_MODE_KEY) === "1",
  getDefaultRedirectPath: (): string => config.defaultRedirectPath,
  resolveRuntime: async (): Promise<AuthRuntime | null> => {
    if (runtimeCache) {
      return runtimeCache;
    }
    try {
      if (config.runtimeProvider) {
        runtimeCache = await config.runtimeProvider();
        return runtimeCache;
      }
      if (config.runtimeUrl) {
        const { runtimeUrl } = config;
        const runtimeModule = (await import(runtimeUrl)) as { default?: AuthRuntime; runtime?: AuthRuntime };
        runtimeCache = runtimeModule.runtime ?? runtimeModule.default ?? null;
        return runtimeCache;
      }
      return null;
    } catch (_ignore) {
      return null;
    }
  },
};
