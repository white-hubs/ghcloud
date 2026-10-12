import { DEV_MOCK_AUTH, type AuthState } from "@ghcloud/cube-services-client/auth-request";

/**
 * WebSocket 无法通过 authRequest 的请求上下文注入鉴权，因此在应用入口同步一份只读用途的鉴权快照。
 */
export const authStore: AuthState = { ...DEV_MOCK_AUTH };

export const initAuthStore = (auth: AuthState): void => {
  authStore.tenant = auth.tenant;
  authStore.terminal = auth.terminal;
  authStore.token = auth.token.replace(/^Bearer\s+/i, "").trim();
};
