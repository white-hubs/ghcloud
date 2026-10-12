import type { Material, MaterialFolder, MaterialType } from "./types";

let mockMaterials: Material[] = [
  { id: "m-1", pathId: "f-img-product", name: "product-01", ext: "png", mimeType: "image/png", size: 1024 * 1024 * 2.5, createTime: "2025-03-01 10:00:00", updateTime: "2025-03-01 10:00:00", url: "https://picsum.photos/seed/m-1/400/300" },
  { id: "m-2", pathId: "f-img-product", name: "product-02", ext: "jpg", mimeType: "image/jpeg", size: 1024 * 1024 * 1.8, createTime: "2025-03-01 11:00:00", updateTime: "2025-03-01 11:00:00", url: "https://picsum.photos/seed/m-2/400/300" },
];

export function getMaterialType(mimeType: string, ext?: string): MaterialType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("font/")) return "font";
  // 根据扩展名兜底
  const imageExts = ["png", "jpg", "jpeg", "gif", "bmp", "webp", "svg", "ico"];
  const videoExts = ["mp4", "avi", "mov", "wmv", "flv", "mkv", "webm"];
  const fontExts = ["ttf", "otf", "woff", "woff2", "eot"];
  if (ext && imageExts.includes(ext.toLowerCase())) return "image";
  if (ext && videoExts.includes(ext.toLowerCase())) return "video";
  if (ext && fontExts.includes(ext.toLowerCase())) return "font";
  return "other";
}

/** 格式化文件大小 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/** 素材类型标签 */
export const MATERIAL_TYPE_OPTIONS = [
  { label: "全部", value: "all" as const },
  { label: "图片", value: "image" as const },
  { label: "视频", value: "video" as const },
  { label: "字体", value: "font" as const },
  { label: "其他", value: "other" as const },
];

/** Mock API（素材移动，待后端接口补充后删除） */
export const mockMaterialApi = {
  /** 移动素材 */
  async moveMaterials(params: { ids: string[]; targetFolderId: string | null }): Promise<void> {
    mockMaterials.forEach((m) => {
      if (params.ids.includes(m.id)) {
        m.pathId = params.targetFolderId;
        m.updateTime = new Date().toISOString().replace("T", " ").slice(0, 19);
      }
    });
  },
};
