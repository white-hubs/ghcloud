import { type Component, defineAsyncComponent } from "vue";

/**
 * 安全管理域卡片。
 * 与 safety-management/cards 同 code 时，统一指向 V2 实现，避免 card-register 末尾 spread 覆盖新版。
 */
export const safety_manage_cards: Record<string, Component> = {
  "alarm-situation-statistics": defineAsyncComponent(
    async () =>
      (await import("@/features/cards/safety-manage-cards/safety-manage/alarm-situation-statistics/alarm-situation-statistics"))
        .AlarmSituationStatistics,
  ),
  "project-record": defineAsyncComponent(async () => import("@/features/cards/safety-management/cards/small-project-records")),
  "inspection-statistics": defineAsyncComponent(
    async () => import("@/features/cards/safety-management/cards/safety-inspection-statistics"),
  ),
  "safety-education-statistics": defineAsyncComponent(
    async () => import("@/features/cards/safety-management/cards/safety-education-statistics"),
  ),
  "fire-equipment-statistics": defineAsyncComponent(
    async () => import("@/features/cards/safety-management/cards/fire-equipment-statistics"),
  ),
};
