import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";

import { authStore } from "@/api/auth-store";

type FloorPlanFileLike = {
  id?: string | number | null;
  path?: string | null;
  endpointPath?: string | null;
};

/** 图片展示地址：相对路径原样返回，绝对 URL 直接使用 */
export function toImageSrc(path?: string | null): string {
  const raw = path?.trim() ?? "";
  if (!raw) {
    return "";
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  if (raw.startsWith("/")) {
    return raw;
  }
  return `/${raw}`;
}

function readApiBaseUrl(): string {
  const env = __ENV__ as { baseApiUrL?: string; baseApiUrl?: string };
  return env.baseApiUrL?.trim() || env.baseApiUrl?.trim() || "/api";
}

function isIntranetHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function isIntranetUrl(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) {
    return false;
  }
  try {
    return isIntranetHost(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** 相对路径补齐 /api 前缀（文件服务常见 /file/...） */
export function normalizeApiPath(path: string): string {
  const raw = toImageSrc(path);
  if (!raw || /^https?:\/\//i.test(raw)) {
    return raw;
  }
  if (raw.startsWith("/api/") || raw === "/api") {
    return raw;
  }
  if (raw.startsWith("/file/")) {
    return `/api${raw}`;
  }
  return raw;
}

function joinUrl(base: string, path: string): string {
  if (/^https?:\/\//i.test(base)) {
    const normalizedBase = base.replace(/\/$/, "");
    return `${normalizedBase}${path}`;
  }
  return path;
}

/** 平面图文件地址：优先 path（网关地址），App 内跳过内网 endpointPath */
export function getFloorPlanImagePath(file?: FloorPlanFileLike | null): string {
  if (!file) {
    return "";
  }
  const path = file.path?.trim() || "";
  const endpointPath = file.endpointPath?.trim() || "";
  if (getEnvironment() === "cubeApp") {
    if (path && !isIntranetUrl(path)) {
      return path;
    }
    if (endpointPath && !isIntranetUrl(endpointPath)) {
      return endpointPath;
    }
    return path || endpointPath;
  }
  return path || endpointPath;
}

/** 下载或跨域资源时使用绝对地址 */
export function resolveFileUrl(path?: string | null): string {
  const raw = normalizeApiPath(path ?? "");
  if (!raw) {
    return "";
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  if (typeof window === "undefined") {
    return raw;
  }
  if (getEnvironment() === "cubeApp") {
    return joinUrl(readApiBaseUrl(), raw);
  }
  return `${window.location.origin}${raw}`;
}

function appendAuthQuery(url: string): string {
  if (!authStore.token || !authStore.tenant) {
    return url;
  }
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}access_token=${encodeURIComponent(authStore.token)}&tenant=${encodeURIComponent(authStore.tenant)}`;
}

function shouldLoadWithAuth(url: string): boolean {
  if (!url) {
    return false;
  }
  if (/^https?:\/\//i.test(url)) {
    return false;
  }
  return url.startsWith("/") || url.includes("/api/") || url.includes("/file/");
}

function logPlanImageInApp(label: string, payload: Record<string, unknown>): void {
  if (getEnvironment() !== "cubeApp") {
    return;
  }
  console.log(`[emergency-dispatch][平面图] ${label}`, payload);
}

const planBlobUrlCache = new Map<string, string>();

async function fetchPlanAsBlobUrl(url: string): Promise<string | null> {
  if (!authStore.token || !authStore.tenant) {
    logPlanImageInApp("鉴权缺失，跳过 fetch", { url, hasToken: Boolean(authStore.token), hasTenant: Boolean(authStore.tenant) });
    return null;
  }
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        tenant: authStore.tenant,
        terminal: authStore.terminal,
      },
    });
    if (!response.ok) {
      logPlanImageInApp("fetch 失败", { url, status: response.status, statusText: response.statusText });
      return null;
    }
    const blobUrl = URL.createObjectURL(await response.blob());
    planBlobUrlCache.set(url, blobUrl);
    logPlanImageInApp("fetch 成功，已转 blob", { url, blobUrl });
    return blobUrl;
  } catch (error) {
    logPlanImageInApp("fetch 异常", { url, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/** App 内 Leaflet 叠加层：解析并拉取平面图 */
export async function resolvePlanOverlayUrl(path?: string | null, file?: FloorPlanFileLike | null): Promise<string> {
  const rawPath = path?.trim() || getFloorPlanImagePath(file);
  const resolvedUrl = resolveFileUrl(rawPath);
  const authQueryUrl = shouldLoadWithAuth(resolvedUrl) ? appendAuthQuery(resolvedUrl) : resolvedUrl;

  logPlanImageInApp("地图叠加地址解析", {
    rawPath,
    path: file?.path ?? "",
    endpointPath: file?.endpointPath ?? "",
    fileId: file?.id ?? "",
    resolvedUrl,
    authQueryUrl,
    apiBase: readApiBaseUrl(),
    pageOrigin: typeof window !== "undefined" ? window.location.origin : "",
    environment: getEnvironment(),
  });

  if (!resolvedUrl) {
    return "";
  }
  if (getEnvironment() !== "cubeApp") {
    return resolvedUrl;
  }

  if (/^https?:\/\//i.test(resolvedUrl) && !isIntranetUrl(resolvedUrl)) {
    logPlanImageInApp("使用公网绝对地址", { overlayUrl: resolvedUrl });
    return resolvedUrl;
  }

  const cached = planBlobUrlCache.get(resolvedUrl);
  if (cached) {
    logPlanImageInApp("使用缓存 blob", { overlayUrl: cached, sourceUrl: resolvedUrl });
    return cached;
  }

  const blobUrl = await fetchPlanAsBlobUrl(resolvedUrl);
  if (blobUrl) {
    return blobUrl;
  }

  if (file?.id && shouldLoadWithAuth(resolvedUrl)) {
    const byIdUrl = resolveFileUrl(`/api/file/file/${String(file.id)}`);
    const byIdAuthUrl = appendAuthQuery(byIdUrl);
    logPlanImageInApp("尝试 fileId 回退地址", { byIdUrl, byIdAuthUrl });
    const byIdBlob = await fetchPlanAsBlobUrl(byIdUrl);
    if (byIdBlob) {
      return byIdBlob;
    }
    logPlanImageInApp("回退为带鉴权 query 的地址", { overlayUrl: byIdAuthUrl });
    return byIdAuthUrl;
  }

  if (shouldLoadWithAuth(resolvedUrl)) {
    logPlanImageInApp("回退为带鉴权 query 的地址", { overlayUrl: authQueryUrl });
    return authQueryUrl;
  }

  logPlanImageInApp("回退为解析地址", { overlayUrl: resolvedUrl });
  return resolvedUrl;
}

export function revokePlanOverlayUrl(url?: string | null): void {
  if (!url || !url.startsWith("blob:")) {
    return;
  }
  URL.revokeObjectURL(url);
  for (const [key, value] of planBlobUrlCache.entries()) {
    if (value === url) {
      planBlobUrlCache.delete(key);
      break;
    }
  }
}
