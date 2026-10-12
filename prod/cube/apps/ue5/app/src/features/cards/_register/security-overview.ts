import { Component, defineAsyncComponent } from "vue";

/** security-overview domain cards */
export const securityOverviewCards: Record<string, Component> = {
  /** 安全2.0 总览 */
  "security-market-overview": defineAsyncComponent(async () => import("@/features/cards/security-overview/cards/security-market-overview")),
  "security-device-count": defineAsyncComponent(async () => import("@/features/cards/security-overview/cards/security-device-count")),
  "security-analysis": defineAsyncComponent(async () => import("@/features/cards/security-overview/cards/security-analysis")),
  "security-risk-source": defineAsyncComponent(async () => import("@/features/cards/security-overview/cards/security-risk-source")),
  "security-manage-trend": defineAsyncComponent(async () => import("@/features/cards/security-overview/cards/security-manage-trend")),
  "public-security-device-count": defineAsyncComponent(
    async () => import("@/features/cards/security-overview/cards/public-security-device-count"),
  ),
  // 设备分布统计
  "public-offline-rate-equipment": defineAsyncComponent(
    async () => import("@/features/cards/security-overview/cards/public-offline-rate-equipment"),
  ),
  // 设备处理及趋势分析
  "public-equipment-processing-trends": defineAsyncComponent(
    async () => import("@/features/cards/security-overview/cards/public-equipment-processing-trendsV2"),
  ),
  // 报警处理排名
  "public-alarm-processing-ranking": defineAsyncComponent(
    async () => import("@/features/cards/security-overview/cards/public-alarm-processing-ranking"),
  ),
  "public-alarm-situation-pie": defineAsyncComponent(
    async () => import("@/features/cards/security-overview/cards/public-alarm-situation-pie"),
  ),
  // 报警状态统计 & 报警趋势折线图统计
  "alarm-status-and-trend": defineAsyncComponent(async () => import("@/features/cards/security-overview/cards/alarm-status-and-trend")),
  // 报警状态统计 & 报警列表统计
  "alarm-status-and-list": defineAsyncComponent(async () => import("@/features/cards/security-overview/cards/alarm-status-and-list")),
};
