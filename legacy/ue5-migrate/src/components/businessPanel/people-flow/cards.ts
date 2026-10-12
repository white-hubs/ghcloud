import { type Component, defineAsyncComponent } from "vue";

export const people_flow_cards: Record<string, Component> = {
  // 今日人流量统计
  "people-flow-today-statistics": defineAsyncComponent(
    async () =>
      (await import("@/components/businessPanel/people-flow/cards/people-flow-today-statistics/people-flow-today-statistics"))
        .PeopleFlowTodayStatistics,
  ),
  // 人流量分析
  "people-flow-statistics": defineAsyncComponent(
    async () =>
      (await import("@/components/businessPanel/people-flow/cards/people-flow-statistics/people-flow-statistics")).PeopleFlowStatistics,
  ),
  // 各区域人流量
  "people-flow-distribution": defineAsyncComponent(
    async () =>
      (await import("@/components/businessPanel/people-flow/cards/people-flow-distribution/people-flow-distribution"))
        .PeopleFlowDistribution,
  ),
  // 人流监控
  "people-flow-monitor": defineAsyncComponent(
    async () => (await import("@/components/businessPanel/people-flow/cards/people-flow-monitor/people-flow-monitor")).PeopleFlowMonitor,
  ),
  // 各点位人流量
  "people-flow-point": defineAsyncComponent(
    async () => (await import("@/components/businessPanel/people-flow/cards/people-flow-point/people-flow-point")).PeopleFlowPoint,
  ),
  // 报警事件统计
  "people-flow-alarm": defineAsyncComponent(
    async () => (await import("@/components/businessPanel/people-flow/cards/people-flow-alarm/people-flow-alarm")).PeopleFlowAlarm,
  ),
  // 报警通知记录
  "people-flow-alarm-record": defineAsyncComponent(
    async () =>
      (await import("@/components/businessPanel/people-flow/cards/people-flow-alarm-record/people-flow-alarm-record.vue")).default,
  ),
};
