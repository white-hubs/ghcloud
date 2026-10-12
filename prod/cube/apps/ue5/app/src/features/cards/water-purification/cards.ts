import { type Component, defineAsyncComponent } from "vue";

export const water_purification_cards: Record<string, Component> = {
  // 净水用量情况
  "water-usage-situation": defineAsyncComponent(
    async () => (await import("@/features/cards/water-purification/cards/water-usage-situation")).WaterUsageSituation,
  ),
  // 净水使用趋势
  "water-usage-trend": defineAsyncComponent(
    async () => (await import("@/features/cards/water-purification/cards/water-usage-trend")).WaterUsageTrend,
  ),
  // 区域使用量概况
  "area-usage-overview": defineAsyncComponent(
    async () => (await import("@/features/cards/water-purification/cards/area-usage-overview")).AreaUsageOverview,
  ),
};
