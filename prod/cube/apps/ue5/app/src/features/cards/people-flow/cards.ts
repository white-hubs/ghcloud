import { type Component, defineAsyncComponent } from "vue";

export const PEOPLE_FLOW_FILLABLE_CARD_CODES = new Set([
  "people-flow-point",
  "people-flow-statistics",
  "people-flow-distribution",
  "people-flow-today-statistics",
]);

export const people_flow_cards: Record<string, Component> = {
  "people-flow-today-statistics": defineAsyncComponent(
    async () =>
      (await import("@/features/cards/people-flow/cards/people-flow-today-statistics/people-flow-today-statistics"))
        .PeopleFlowTodayStatistics,
  ),
  "people-flow-statistics": defineAsyncComponent(
    async () => (await import("@/features/cards/people-flow/cards/people-flow-statistics/people-flow-statistics")).PeopleFlowStatistics,
  ),
  "people-flow-distribution": defineAsyncComponent(
    async () =>
      (await import("@/features/cards/people-flow/cards/people-flow-distribution/people-flow-distribution")).PeopleFlowDistribution,
  ),
  "people-flow-monitor": defineAsyncComponent(
    async () => (await import("@/features/cards/people-flow/cards/people-flow-monitor/people-flow-monitor")).PeopleFlowMonitor,
  ),
  "people-flow-point": defineAsyncComponent(
    async () => (await import("@/features/cards/people-flow/cards/people-flow-point/people-flow-point")).PeopleFlowPoint,
  ),
  "people-flow-alarm": defineAsyncComponent(
    async () => (await import("@/features/cards/people-flow/cards/people-flow-alarm/people-flow-alarm")).PeopleFlowAlarm,
  ),
  "people-flow-alarm-record": defineAsyncComponent(
    async () => (await import("@/features/cards/people-flow/cards/people-flow-alarm-record/people-flow-alarm-record")).default,
  ),
};
