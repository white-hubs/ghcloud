import type { SpaceKind } from "../models/space-archive";

export const SPACE_PARK_NAME = "古河化工园区";
export const SPACE_KINDS: Record<SpaceKind, { label: string; color: string; child: SpaceKind | null; usageLabel: string }> = {
  area: { label: "区域", color: "blue", child: "building", usageLabel: "区域用途" },
  building: { label: "楼栋", color: "cyan", child: "floor", usageLabel: "建筑用途" },
  floor: { label: "楼层", color: "purple", child: "room", usageLabel: "实际层数" },
  room: { label: "房间", color: "orange", child: null, usageLabel: "房间类型" },
};
export const SPACE_KIND_OPTIONS = (Object.keys(SPACE_KINDS) as SpaceKind[]).map((value) => ({ value, label: SPACE_KINDS[value].label }));
export const SPACE_STATUS_OPTIONS = [
  { value: "enabled", label: "启用" },
  { value: "disabled", label: "停用" },
];
export const ROOM_TYPE_OPTIONS = ["办公室", "会议室", "设备用房", "生产用房", "仓储用房", "公共区域", "其他"].map((value) => ({
  value,
  label: value,
}));
export const FLOOR_PLAN_EXTENSIONS = ["png", "jpg", "jpeg", "dwg", "dxf"];
export const FLOOR_PLAN_ACCEPT = FLOOR_PLAN_EXTENSIONS.map((extension) => `.${extension}`).join(",");
export const FLOOR_PLAN_MAX_BYTES = 20 * 1024 * 1024;

export function planExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function isPlanImage(fileName: string): boolean {
  return ["png", "jpg", "jpeg", "svg"].includes(planExtension(fileName));
}

export function formatPlanSize(size: number): string {
  return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`;
}
