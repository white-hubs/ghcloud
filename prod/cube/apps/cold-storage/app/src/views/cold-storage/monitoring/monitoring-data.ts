import type { ColdStoreMonitorMetric } from "@ghcloud/cube-service-interface/cold-storage";

import type { StatItem, Tone } from "../shared/components";

type MonitorStatus = "normal" | "leak" | "warn" | "off";

export interface ColdStoreMonitorStatusCard {
  status?: string;
  statusName?: string;
  warningText?: string;
}

export const normalizeMonitorStatus = (status?: string): MonitorStatus => {
  const normalized = String(status ?? "").toUpperCase();
  if (["LEAK", "AMMONIA_EXCEPTION", "AMMONIA_ABNORMAL"].includes(normalized)) {
    return "leak";
  }
  if (["OFF", "OFFLINE"].includes(normalized)) {
    return "off";
  }
  if (normalized && !["NORMAL", "ONLINE"].includes(normalized)) {
    return "warn";
  }
  return "normal";
};

export const monitorStatusTone = (status?: string): Tone => {
  const normalized = normalizeMonitorStatus(status);
  if (normalized === "leak") {
    return "red";
  }
  if (normalized === "warn") {
    return "orange";
  }
  if (normalized === "off") {
    return "gray";
  }
  return "green";
};

export const monitorStatusText = (card: ColdStoreMonitorStatusCard): string => {
  if (card.statusName) {
    return card.statusName;
  }
  const normalized = normalizeMonitorStatus(card.status);
  if (normalized === "off") {
    return "离线";
  }
  if (normalized === "normal") {
    return "正常";
  }
  return "异常";
};

export const monitorFootText = (card: ColdStoreMonitorStatusCard & { onlineDeviceCount?: number }): string => {
  if (card.warningText) {
    return card.warningText;
  }
  if (card.onlineDeviceCount != null) {
    return `${card.onlineDeviceCount}台设备在线`;
  }
  return "--";
};

export const metricValueText = (metric: ColdStoreMonitorMetric): string => {
  const value = metric.value ?? "--";
  return metric.unit ? `${value} ${metric.unit}` : value;
};

export const metricTone = (metric: ColdStoreMonitorMetric): Tone => (metric.abnormal ? "orange" : "green");

export const monitorMetrics = (metrics: ColdStoreMonitorMetric[] = []): StatItem[] =>
  metrics.map((metric) => ({
    label: metric.name || metric.code || "--",
    value: metricValueText(metric),
    tone: metricTone(metric),
  }));
