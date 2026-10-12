import { DEV_MOCK_AUTH, type AuthState } from "@ghcloud/cube-services-client/auth-request";

const GH_ENTERPRISE = "GH-NowEnterprise";
const GH_TOKEN = "GH-Token";

interface SessionEnterprise {
  code?: string | number;
}

interface SessionToken {
  access_token?: string;
}

function parseSessionItem<T extends object>(key: string): T | undefined {
  const raw = sessionStorage.getItem(key);
  if (!raw) {
    return undefined;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export function readSessionAuth(): AuthState | undefined {
  if (typeof sessionStorage === "undefined") {
    return undefined;
  }

  const enterprise = parseSessionItem<SessionEnterprise>(GH_ENTERPRISE);
  const token = parseSessionItem<SessionToken>(GH_TOKEN);
  const accessToken = token?.access_token?.replace(/^Bearer\s+/i, "").trim();
  if (!enterprise?.code || !accessToken) {
    return undefined;
  }

  return {
    tenant: Number(enterprise.code) || 0,
    terminal: DEV_MOCK_AUTH.terminal,
    token: accessToken,
  };
}
