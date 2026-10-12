import { Tag } from "vant";
import { h, type VNode } from "vue";

const pad = (value: number): string => String(value).padStart(2, "0");

const formatTimestamp = (value: number): string | undefined => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 2000 || date.getFullYear() > 2100) {
    return undefined;
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const getUrlParams = (): Record<string, string> => {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

export const formatText = (value?: string | number | null): string => {
  if (value === undefined || value === null || value === "") {
    return "--";
  }
  if (typeof value === "number") {
    return formatTimestamp(value) ?? String(value);
  }
  return String(value);
};

export const toPercentNumber = (value?: number | null): number | undefined => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return undefined;
  }
  const numeric = Number(value);
  return Math.abs(numeric) <= 1 ? numeric * 100 : numeric;
};

export const formatPercent = (value?: number | null): string => {
  const percent = toPercentNumber(value);
  return percent === undefined ? "--" : `${percent.toFixed(2)}%`;
};

export const periodLabel = (periodType?: string): string => {
  const map: Record<string, string> = { MONTH: "月度", QUARTER: "季度", YEAR: "年度", DAY: "日", WEEK: "周" };
  return periodType ? (map[periodType] ?? periodType) : "--";
};

export const statusLabel = (status?: string): string => {
  const map: Record<string, string> = {
    UNSIGNED: "待签收",
    SIGNED: "已签收",
    PENDING: "待执行",
    COMPLETED: "已完成",
    OVERDUE: "超期",
  };
  return status ? (map[status] ?? status) : "--";
};

export const statusTag = (status?: string): VNode => {
  const typeMap: Record<string, "primary" | "success" | "warning" | "danger"> = {
    SIGNED: "success",
    UNSIGNED: "warning",
    COMPLETED: "success",
    PENDING: "primary",
    OVERDUE: "danger",
  };
  const props = status && typeMap[status] ? { type: typeMap[status] } : {};
  return h(Tag, props, () => statusLabel(status));
};
