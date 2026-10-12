/**
 * 与 IoT Center App 一致：从 sessionStorage 读取租户与 Token。
 * @see prod/cube/apps/iot-center/app/src/api/service.ts
 */
export interface NorthSessionAuth {
  tenant: string;
  token: string;
  terminal: string;
}

const DEFAULT_TERMINAL = "bimops-manage-web";

export function readAuthFromSession(): NorthSessionAuth {
  const tenantObj = JSON.parse(sessionStorage.getItem("GH-NowEnterprise") ?? "{}") as { code?: string };
  const tokenObj = JSON.parse(sessionStorage.getItem("GH-Token") ?? "{}") as { access_token?: string };
  let raw = tokenObj.access_token ?? "";
  raw = raw.replace(/^bearer\s+/i, "").trim();
  return {
    tenant: tenantObj.code ?? "",
    token: raw,
    terminal: DEFAULT_TERMINAL,
  };
}

/**
 * Session + URL 查询参数覆盖，供 `@ghcloud/cube-iot-center-service`（CubeGateway）与手写 fetch 共用。
 * URL 调试：`?access_token=`、`?token=`、`?tenant=`、`?tenantCode=`
 */
export function readNorthAuthForGateway(): NorthSessionAuth {
  const auth = readAuthFromSession();
  let token = auth.token;
  let tenant = auth.tenant;

  if (typeof window !== "undefined") {
    const query = new URLSearchParams(window.location.search);
    const qToken = query.get("access_token") ?? query.get("token");
    if (qToken) {
      token = qToken.replace(/^bearer\s+/i, "").trim();
    }
    const qTenant = query.get("tenant") ?? query.get("tenantCode");
    if (qTenant) {
      tenant = qTenant.trim();
    }
  }

  return { tenant, terminal: auth.terminal, token };
}

/**
 * 调用 device-center North 接口所需的请求头（与网关 / legacy axios 拦截器一致）。
 */
export function buildNorthDeviceCenterHeaders(): Record<string, string> {
  const auth = readNorthAuthForGateway();
  const headers: Record<string, string> = {};

  if (auth.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }
  if (auth.tenant) {
    headers.tenant = auth.tenant;
  }
  headers.terminal = auth.terminal;

  return headers;
}
