import type { AuthState } from "@ghcloud/cube-services-client/auth-request";

let currentAuth: AuthState | undefined;

export function setPositioningSocketAuth(auth: AuthState): void {
  currentAuth = auth;
}

export function getPositioningSocketAuth(): AuthState | undefined {
  return currentAuth;
}
