export function toOssPreviewPath(info?: { path?: string | null; endpointPath?: string | null }): string {
  if (!info) {
    return "";
  }
  const raw = info.endpointPath || info.path || "";
  if (!raw) {
    return "";
  }
  if (/^https?:\/\//.test(raw)) {
    return raw;
  }
  return raw.startsWith("/") ? raw : `/${raw}`;
}
