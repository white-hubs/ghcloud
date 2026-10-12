export const PAGE_SIZE = 50;

export const WARNING_LEVEL_OPTIONS = [
  { label: "全部", value: "" },
  { label: "蓝色", value: "BLUE" },
  { label: "黄色", value: "YELLOW" },
  { label: "红色", value: "RED" },
] as const;

export const WARNING_LEVEL_LABEL: Record<string, string> = {
  BLUE: "蓝色",
  YELLOW: "黄色",
  RED: "红色",
};

export const WARNING_LEVEL_TAG: Record<string, "primary" | "warning" | "danger"> = {
  BLUE: "primary",
  YELLOW: "warning",
  RED: "danger",
};

export const PUSH_STATUS_OPTIONS = [
  { label: "全部", value: "" },
  { label: "无需推送", value: "NOT_REQUIRED" },
  { label: "未配置", value: "UNCONFIGURED" },
  { label: "待推送", value: "PENDING" },
  { label: "已推送", value: "SENT" },
  { label: "推送失败", value: "FAILED" },
] as const;

export const PUSH_STATUS_LABEL: Record<string, string> = {
  NOT_REQUIRED: "无需推送",
  UNCONFIGURED: "未配置",
  PENDING: "待推送",
  SENT: "已推送",
  NOT_PUSHED: "未推送",
  PUSHED: "已推送",
  PUSHING: "推送中",
  FAILED: "推送失败",
  PARTIAL: "部分成功",
  SUCCESS: "已推送",
};

export const SENTIMENT_LABEL: Record<string, string> = {
  positive: "正面",
  neutral: "中性",
  negative: "负面",
  unknown: "未知",
};

export const REPORT_STATUS_LABEL: Record<string, string> = {
  NOT_GENERATED: "未生成",
  DRAFT: "草稿",
  FINALIZED: "已定稿",
};
