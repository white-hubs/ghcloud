import { Tag } from "vant";

import { HazardGovernanceStatus, HazardLevel, HazardSourceType } from "@ghcloud/cube-service-interface/hazard-governance";

const levelText: Record<string, string> = {
  [HazardLevel.GENERAL]: "一般",
  [HazardLevel.MAJOR]: "重大",
  [HazardLevel.CRITICAL]: "特重大",
};

const statusText: Record<string, string> = {
  [HazardGovernanceStatus.PENDING_CONFIRM]: "待确认",
  [HazardGovernanceStatus.PENDING_PLAN]: "待填写",
  [HazardGovernanceStatus.PENDING_APPROVAL]: "待审批",
  [HazardGovernanceStatus.PLAN_REJECTED]: "方案被退回",
  [HazardGovernanceStatus.RECTIFYING]: "整改中",
  [HazardGovernanceStatus.PENDING_ACCEPTANCE]: "待验收",
  [HazardGovernanceStatus.ACCEPTANCE_REJECTED]: "验收不通过",
  [HazardGovernanceStatus.MISREPORTED]: "误报",
  [HazardGovernanceStatus.ACCEPTANCE_COMPLETED]: "验收完成",
};

const sourceText: Record<string, string> = {
  [HazardSourceType.AI_WARNING]: "AI视频巡检",
  [HazardSourceType.IOT_ALARM]: "物联告警",
  [HazardSourceType.INSPECTION]: "巡检",
  [HazardSourceType.AI_IMAGE_RECOGNITION]: "AI识别",
  [HazardSourceType.MANUAL]: "人工上报",
};

const padDatePart = (value: number): string => String(value).padStart(2, "0");

const formatDateObject = (date: Date): string => {
  if (!Number.isFinite(date.getTime())) {
    return "-";
  }
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())} ${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}:${padDatePart(date.getSeconds())}`;
};

const formatTimestamp = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "-";
  }
  const milliseconds = Math.abs(value) < 1_000_000_000_000 ? value * 1000 : value;
  return formatDateObject(new Date(milliseconds));
};

const formatDateParts = (parts: unknown[]): string => {
  const values = parts.map(Number);
  if (values.length < 3 || values.slice(0, 3).some((value) => !Number.isFinite(value))) return "-";
  const [year, month, day, hour = 0, minute = 0, second = 0] = values;
  return `${year}-${padDatePart(month)}-${padDatePart(day)} ${padDatePart(hour)}:${padDatePart(minute)}:${padDatePart(second)}`;
};

export const formatServiceDate = (value: unknown): string => {
  if (typeof value === "number") return formatTimestamp(value);
  if (Array.isArray(value)) return formatDateParts(value);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const date = record.date as Record<string, unknown> | undefined;
    const time = record.time as Record<string, unknown> | undefined;
    return formatDateParts([
      date?.year ?? record.year,
      date?.monthValue ?? date?.month ?? record.monthValue ?? record.month,
      date?.dayOfMonth ?? date?.day ?? record.dayOfMonth ?? record.day,
      time?.hour ?? record.hour,
      time?.minute ?? record.minute,
      time?.second ?? record.second,
    ]);
  }
  if (typeof value !== "string" || !value.trim()) return "-";
  const trimmed = value.trim();
  if (/^-?\d+$/.test(trimmed)) {
    return formatTimestamp(Number(trimmed));
  }
  return trimmed.replace("T", " ").slice(0, 19);
};

export const renderServiceLevelTag = (level?: string): JSX.Element => {
  const type = level === HazardLevel.CRITICAL ? "danger" : level === HazardLevel.MAJOR ? "warning" : "primary";
  return <Tag type={type}>{level ? (levelText[level] ?? "-") : "-"}</Tag>;
};

export const renderServiceStatusTag = (status?: string): JSX.Element => {
  const type =
    status === HazardGovernanceStatus.ACCEPTANCE_COMPLETED
      ? "success"
      : status === HazardGovernanceStatus.MISREPORTED
        ? "default"
        : status === HazardGovernanceStatus.PLAN_REJECTED || status === HazardGovernanceStatus.ACCEPTANCE_REJECTED
          ? "danger"
          : status === HazardGovernanceStatus.PENDING_APPROVAL
            ? "primary"
            : "warning";
  return <Tag type={type}>{status ? (statusText[status] ?? "-") : "-"}</Tag>;
};

export const formatServiceLevel = (level?: string): string => (level ? (levelText[level] ?? "-") : "-");

export const formatServiceStatus = (status?: string): string => (status ? (statusText[status] ?? "-") : "-");

export const formatServiceSource = (sourceType?: string): string => (sourceType ? (sourceText[sourceType] ?? "-") : "-");

export const formatDeadlineHint = (overdue?: boolean, overdueHours?: number, remainingHours?: number): string => {
  if (overdue) {
    return overdueHours != null ? `已逾期 ${Math.ceil(overdueHours)} 小时` : "已逾期";
  }
  return remainingHours != null ? `剩余 ${Math.max(0, Math.ceil(remainingHours))} 小时` : "";
};
