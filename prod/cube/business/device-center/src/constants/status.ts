/**
 * 状态枚举值
 */
export enum Status {
  /** 禁用/否 */
  DISABLED = 0,
  /** 启用/是 */
  ENABLED = 1,
}

/**
 * 状态选项（用于 Select、RadioGroup 等组件）
 */
export const STATUS_OPTIONS = [
  { label: "是", value: Status.ENABLED },
  { label: "否", value: Status.DISABLED },
] as const;

/**
 * 状态映射表（用于翻译）
 */
export const STATUS_MAP: Record<number, string> = {
  [Status.DISABLED]: "否",
  [Status.ENABLED]: "是",
};

/**
 * 获取状态标签（翻译函数）
 * @param status 状态值（数字）
 * @returns 状态中文标签，如果未找到则返回原值或 "--"
 */
export const getStatusLabel = (status: number | string | null | undefined): string => {
  if (status === null || status === undefined) {
    return "--";
  }
  const statusValue = typeof status === "string" ? Number.parseInt(status, 10) : status;
  if (Number.isNaN(statusValue)) {
    return String(status);
  }
  return STATUS_MAP[statusValue] ?? String(status);
};
