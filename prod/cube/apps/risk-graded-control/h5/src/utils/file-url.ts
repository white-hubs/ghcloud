import type { RiskControlFileVO } from "@/types/risk";

type FilePathLike = Pick<RiskControlFileVO, "path" | "endpointPath">;

/** 图片展示地址：优先 path（相对路径），path 为空时再回退 endpointPath */
export function toImageSrc(file: FilePathLike): string {
  const raw = file.path?.trim() || file.endpointPath?.trim() || "";
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return raw;
  return `/${raw}`;
}

export function resolveFileDisplayPath(file?: RiskControlFileVO | null): string {
  if (!file) return "";
  const fromPath = toImageSrc({ path: file.path, endpointPath: "" });
  if (fromPath) return fromPath;
  return toImageSrc({ path: "", endpointPath: file.endpointPath });
}

export function normalizeUploadPath(path?: string | null): string {
  return toImageSrc({ path: path?.trim() || "", endpointPath: "" });
}
