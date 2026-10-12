import { Component, defineAsyncComponent } from "vue";

/** universal-panel domain cards */
export const universalPanelCards: Record<string, Component> = {
  "device-offlineRate": defineAsyncComponent(async () => import("@/features/cards/universal-panel/components/DeviceOfflineRate")),
  // 设备状态总览
  "equipment-statusOverview": defineAsyncComponent(
    async () => import("@/features/cards/universal-panel/components/EquipmentStatusOverview"),
  ),
  // 设备状态统计
  "equipment-status": defineAsyncComponent(async () => import("@/features/cards/universal-panel/components/equipmentStatus")),
  // 报警级别分布
  "alarm-level": defineAsyncComponent(async () => import("@/features/cards/universal-panel/components/alarm-level")),
  // 事件报警Top5
  "event-alarm-top5": defineAsyncComponent(async () => import("@/features/cards/universal-panel/components/event-alarm-top5")),
  // 设备报警Top5
  "equipment-alarm-top5": defineAsyncComponent(async () => import("@/features/cards/universal-panel/components/equipment-alarm-top5")),
  // 报警处理情况
  "alarm-status": defineAsyncComponent(async () => import("@/features/cards/universal-panel/components/alarm-processing-status")),
  // 报警占比
  "alarm-rate": defineAsyncComponent(async () => import("@/features/cards/universal-panel/components/alarm-application-rate")),
  // 设备报警明细
  "equipment-details": defineAsyncComponent(async () => import("@/features/cards/universal-panel/components/equipment-alarm-details")),
  // 设备报警率
  "equipment-rate": defineAsyncComponent(async () => import("@/features/cards/universal-panel/components/equipment-alarm-rate")),
  // 设备实时数据
  "equipment-real-time-data": defineAsyncComponent(
    async () => import("@/features/cards/universal-panel/components/equipment-real-time-data"),
  ),
  // 设备报警趋势
  "equipment-trend": defineAsyncComponent(async () => import("@/features/cards/universal-panel/components/equipment-alarm-trend")),
  // 设备异常统计
  "equipment-statistics": defineAsyncComponent(
    async () => import("@/features/cards/universal-panel/components/equipment-anomaly-statistics"),
  ),
  // 离线设备明细
  "device-offline-details": defineAsyncComponent(async () => import("@/features/cards/universal-panel/components/device-offline-details")),
  // 设备情况总览
  "equipment-overview": defineAsyncComponent(
    async () => import("@/features/cards/universal-panel/components/equipment-overview/equipment-overview"),
  ),
  // 设备离线情况
  "device-offline-situation": defineAsyncComponent(
    async () => import("@/features/cards/universal-panel/components/device-offline-situation"),
  ),
  // 设备统计
  "public-device-distribution": defineAsyncComponent(
    async () => import("@/features/cards/universal-panel/components/public-device-distribution"),
  ),
  // 楼层设备数据
  "floor-device-list": defineAsyncComponent(async () => import("@/features/cards/universal-panel/components/floor-device-list")),
  // 管廊设备数据
  "pipe-device-list": defineAsyncComponent(async () => import("@/features/cards/universal-panel/components/pipe-device-list")),
  // 设备分类统计
  "public-device-classification": defineAsyncComponent(
    async () => import("@/features/cards/universal-panel/components/public-device-classification"),
  ),
  // 设备离线率
};
