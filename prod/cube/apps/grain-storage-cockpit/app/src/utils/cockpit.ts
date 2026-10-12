import type { ConcernBatch, CockpitFilters, RiskEvent } from "@/types/cockpit";

const matchesCommonFilters = (item: { depot: string; grain: string | null; level: string }, filters: CockpitFilters): boolean => {
  if (filters.depot !== "全部" && item.depot !== filters.depot) return false;
  if (filters.grain !== "全部" && item.grain !== filters.grain) return false;
  if (filters.level !== "全部" && item.level !== filters.level) return false;
  return true;
};

export const filterRiskEvents = (events: RiskEvent[], filters: CockpitFilters): RiskEvent[] => {
  return events.filter((event) => matchesCommonFilters(event, filters));
};

export const filterConcernBatches = (batches: ConcernBatch[], filters: CockpitFilters): ConcernBatch[] => {
  return batches.filter((batch) => matchesCommonFilters({ ...batch, grain: batch.grain }, filters));
};

export const resolvePalletCardUrl = (isQiankun: boolean): string => {
  return isQiankun ? "/portal/granary-location-card/pallet-position-card?wid=95" : "/apps/granary/pallet-position-card?wid=95";
};
