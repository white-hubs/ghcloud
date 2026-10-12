import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import type { KeyPersonRiskLevel } from "@ghcloud/cube-service-interface/safety-personnel";

export const APPLICATION_CODE = "SAFETY_PERSONNEL";

export type PersonnelTypeCode = "ALL" | "SAFETY" | "SPECIAL" | "EMERGENCY";

export const PERSON_TYPE_OPTIONS: Array<{ label: string; value: PersonnelTypeCode }> = [
  { label: "全部", value: "ALL" },
  { label: "安全人员", value: "SAFETY" },
  { label: "特种作业", value: "SPECIAL" },
  { label: "应急人员", value: "EMERGENCY" },
];

export const PERSON_TYPE_LABEL: Record<PersonnelTypeCode, string> = {
  ALL: "全部",
  SAFETY: "安全人员",
  SPECIAL: "特种作业",
  EMERGENCY: "应急人员",
};

export const RESUME_TYPE_OPTIONS = [
  { label: "时间线", value: "timeline" },
  { label: "巡检", value: "patrol" },
  { label: "报警", value: "alarm" },
  { label: "审批", value: "approval" },
  { label: "会议培训", value: "meeting" },
  { label: "其他", value: "other" },
];

export const KEY_PERSON_RISK_LEVEL_OPTIONS: Array<{ label: string; value: KeyPersonRiskLevel | "" }> = [
  { label: "全部", value: "" },
  { label: "高风险", value: "HIGH" },
  { label: "中风险", value: "MEDIUM" },
  { label: "低风险", value: "LOW" },
];

export const KEY_PERSON_RISK_LEVEL_LABEL: Record<KeyPersonRiskLevel, string> = {
  HIGH: "高风险",
  MEDIUM: "中风险",
  LOW: "低风险",
};

export const KEY_PERSON_SCENE = {
  PHOTO: GLOBAL_SCENE_CODE.securityKeyPersonPhoto,
  ATTACHMENT: GLOBAL_SCENE_CODE.securityKeyPersonAttachment,
  REPORT: GLOBAL_SCENE_CODE.securityKeyPersonReportAttachment,
};
