import { defineComponent } from "vue";

import type { LiangcangTemperatureAlertGlobalConfigVO, LiangcangTemperatureAlertStatus } from "@ghcloud/cube-granary-management-service";

export type TemperatureAlertPageKey = "config" | "records" | "trend";

export const PAGE_SIZE = 10;

export const pad = (value: number): string => String(value).padStart(2, "0");

export const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const formatDateTime = (value: unknown, emptyText = "--"): string => {
  if (value == null || value === "") {
    return emptyText;
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const timestamp = Number(value);
    if (Number.isFinite(timestamp)) {
      const date = new Date(value.trim().length === 10 ? timestamp * 1000 : timestamp);
      return Number.isNaN(date.getTime())
        ? emptyText
        : `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(value < 10000000000 ? value * 1000 : value);
    return Number.isNaN(date.getTime())
      ? emptyText
      : `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? emptyText
      : `${formatDate(value)} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
  }
  const rawText = String(value).trim();
  const parsedDate = new Date(rawText.replace(" ", "T"));
  if (Number.isNaN(parsedDate.getTime())) {
    return rawText || emptyText;
  }
  return `${formatDate(parsedDate)} ${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}:${pad(parsedDate.getSeconds())}`;
};

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const hasTimePart = (value: string): boolean => /\d{2}:\d{2}:\d{2}/.test(value);

export const toDateTimeBegin = (date: string): string => {
  const value = date.trim();
  return hasTimePart(value) ? value : `${value} 00:00:00`;
};

export const toDateTimeEnd = (date: string): string => {
  const value = date.trim();
  return hasTimePart(value) ? value : `${value} 23:59:59`;
};

export const formatNumber = (value: number | null | undefined, digits = 1): string => {
  if (value == null || !Number.isFinite(value)) {
    return "--";
  }
  return value.toFixed(digits);
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const statusText = (status: LiangcangTemperatureAlertStatus | string): string => {
  if (status === "ACTIVE") {
    return "预警中";
  }
  if (status === "CLEARED") {
    return "已消除";
  }
  return String(status || "--");
};

export const clearReasonText = (reason: string): string => {
  if (reason === "TREND_REVERSED") {
    return "趋势反转";
  }
  if (reason === "LEFT_DANGER_ZONE") {
    return "脱离危险区";
  }
  return reason || "--";
};

export const createDefaultGlobalConfig = (): LiangcangTemperatureAlertGlobalConfigVO => ({
  consecutiveDays: 3,
  minDailyIncrease: 0.3,
  warningThreshold: 25,
  approachMargin: 3,
});

export const normalizeGlobalConfig = (config: LiangcangTemperatureAlertGlobalConfigVO | null): LiangcangTemperatureAlertGlobalConfigVO => ({
  ...createDefaultGlobalConfig(),
  ...(config ?? {}),
});

export const TemperatureAlertHeader = defineComponent({
  name: "TemperatureAlertHeader",
  setup: () => {
    return (): JSX.Element => (
      <div class="temperature-alert-header">
        <h2>粮仓温度趋势预警</h2>
      </div>
    );
  },
});
