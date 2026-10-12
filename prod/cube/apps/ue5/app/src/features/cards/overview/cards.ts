import { type Component, defineAsyncComponent } from "vue";

export const overview_cards: Record<string, Component> = {
  // 安全运营天数
  "safe-operation-days": defineAsyncComponent(
    async () => (await import("@/features/cards/overview/cards/safe-operation-days/safe-operation-days")).default,
  ),
  // 报警态势
  "alarm-situation": defineAsyncComponent(
    async () => (await import("@/features/cards/overview/cards/alarm-situation/alarm-situation")).default,
  ),
  // 设备态势
  "device-situation": defineAsyncComponent(
    async () => (await import("@/features/cards/overview/cards/device-situation/device-situation")).default,
  ),
  // 巡查态势
  "patrol-situation": defineAsyncComponent(
    async () => (await import("@/features/cards/overview/cards/patrol-situation/patrol-situation")).default,
  ),
  // 监控态势
  "monitor-situation": defineAsyncComponent(
    async () => (await import("@/features/cards/overview/cards/monitor-situation/monitor-situation")).default,
  ),
  // 监控人员统计
  "monitor-personnel-statistics": defineAsyncComponent(
    async () => (await import("@/features/cards/overview/cards/monitor-personnel-statistics/monitor-personnel-statistics")).default,
  ),
  // 管理态势
  "management-situation": defineAsyncComponent(
    async () => (await import("@/features/cards/overview/cards/management-situation/management-situation")).default,
  ),
};
