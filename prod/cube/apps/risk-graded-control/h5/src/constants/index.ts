import type { IdentificationStatus, RiskLevel } from "@/types/risk";

export const RISK_LEVEL_LABEL: Record<RiskLevel, string> = {
  MAJOR: "重大风险",
  SIGNIFICANT: "较大风险",
  GENERAL: "一般风险",
  LOW: "低风险",
};

export const RISK_LEVEL_TAG_TYPE: Record<RiskLevel, "danger" | "warning" | "primary" | "success"> = {
  MAJOR: "danger",
  SIGNIFICANT: "warning",
  GENERAL: "primary",
  LOW: "success",
};

export const RISK_BORDER_COLOR: Record<RiskLevel, string> = {
  MAJOR: "#f5222d",
  SIGNIFICANT: "#fa8c16",
  GENERAL: "#faad14",
  LOW: "#1890ff",
};

export const IDENTIFICATION_STATUS_LABEL: Record<IdentificationStatus, string> = {
  PENDING: "待辨识",
  IDENTIFYING: "辨识中",
  PENDING_REVIEW: "待审核",
  REVIEWED: "已审核",
};

export const IDENTIFICATION_STATUS_TAG: Record<IdentificationStatus, "default" | "primary" | "warning" | "success"> = {
  PENDING: "default",
  IDENTIFYING: "primary",
  PENDING_REVIEW: "warning",
  REVIEWED: "success",
};

export const ACCIDENT_TYPES = ["火灾", "爆炸", "中毒窒息", "触电", "机械伤害", "高处坠落", "物体打击", "灼烫", "其他"] as const;
export const CONTROL_TYPES = ["工程技术", "管理", "培训教育", "个体防护", "应急处置", "其他"] as const;
export const CONTROL_LEVELS = ["公司级", "部门级", "班组级", "岗位级"] as const;

export const unitAvatarText = (name: string): string => name.trim().charAt(0) || "单";

/** file-service 场景码（与后端 FILE_SCENE_CODE 一致） */
export const FILE_SCENE_CODE = {
  WARNING_SIGN_ICON: "RISK::CONTROL_WARNING_SIGN_ICON",
  MEASURE_EXECUTION_ATTACHMENT: "RISK::CONTROL_MEASURE_EXECUTION_ATTACHMENT",
  AI_IDENTIFICATION_PHOTO: "RISK::CONTROL_AI_IDENTIFICATION_PHOTO",
} as const;

export const FILE_BUCKET = "risk-control";

export const MAX_MEASURE_EXECUTION_ATTACHMENTS = 9;
