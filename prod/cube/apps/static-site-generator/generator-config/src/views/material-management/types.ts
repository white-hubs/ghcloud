/** 素材类型 */
export type MaterialType = "image" | "video" | "font" | "other";

/** 素材目录 */
export interface MaterialFolder {
  id: string;
  pathId: string | null;
  name: string;
  sort: number;
  createTime: string;
  updateTime: string;
  children?: MaterialFolder[];
}

/** 素材 */
export interface Material {
  id: string;
  pathId: string | null;
  name: string;
  ext: string;
  mimeType: string;
  size: number;
  createTime: string;
  updateTime: string;
  url?: string;
}

/** 素材类型筛选选项 */
export interface MaterialTypeOption {
  label: string;
  value: MaterialType | "all";
}

/** 右键菜单操作类型 */
export type ContextMenuAction = "open" | "rename" | "move" | "delete";

/** 素材选择弹窗模式 */
export type SelectMode = "single" | "multiple";
