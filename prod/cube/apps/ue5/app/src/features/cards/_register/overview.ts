import { Component, defineAsyncComponent } from "vue";

/** overview domain cards */
export const overviewCards: Record<string, Component> = {
  /** 总览 */
  "safe-operation-days": defineAsyncComponent(
    async () => (await import("@/features/cards/overview/cards/safe-operation-days/safe-operation-days")).default,
  ),
  "overview-alarm-situation": defineAsyncComponent(
    async () => (await import("@/features/cards/overview/cards/overview-alarm-situation/overview-alarm-situation")).default,
  ),
  "device-situation": defineAsyncComponent(
    async () => (await import("@/features/cards/overview/cards/device-situation/device-situation")).default,
  ),
  "patrol-situation": defineAsyncComponent(
    async () => (await import("@/features/cards/overview/cards/patrol-situation/patrol-situation")).default,
  ),
  "monitor-situation": defineAsyncComponent(
    async () => (await import("@/features/cards/overview/cards/monitor-situation/monitor-situation")).default,
  ),
  "monitor-personnel-statistics": defineAsyncComponent(
    async () => (await import("@/features/cards/overview/cards/monitor-personnel-statistics/monitor-personnel-statistics")).default,
  ),
  "management-situation": defineAsyncComponent(
    async () => (await import("@/features/cards/overview/cards/management-situation/management-situation")).default,
  ),
};
