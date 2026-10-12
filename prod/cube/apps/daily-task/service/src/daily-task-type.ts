import type { RouteLocationNormalizedLoaded } from "vue-router";

export const DailyTaskType = {
  DailyTask: "DAILY_TASK",
  Inspection: "DAILY_INSPECTION",
  SmallInspection: "DAILY_SMALL_INSPECTION",
  GridTask: "GRID_MANAGE",
};

export type DailyTaskTypeValue = (typeof DailyTaskType)[keyof typeof DailyTaskType];

const DAILY_TYPE_STORAGE_KEY = "cube:dailyType" as const;

function normalizeDailyType(input: string | null | undefined): DailyTaskTypeValue | null {
  const values = Object.values(DailyTaskType) as DailyTaskTypeValue[];
  if (!input) {
    return null;
  }
  return values.includes(input as DailyTaskTypeValue) ? (input as DailyTaskTypeValue) : null;
}

function readStoredDailyType(): DailyTaskTypeValue | null {
  const raw = sessionStorage.getItem(DAILY_TYPE_STORAGE_KEY);
  return normalizeDailyType(raw);
}

export function setCurrentDailyType(dailyType: DailyTaskTypeValue): void {
  sessionStorage.setItem(DAILY_TYPE_STORAGE_KEY, dailyType);
}

export function initDailyTypeFromRoute(route: RouteLocationNormalizedLoaded): DailyTaskTypeValue {
  const queryVal = route.query.dailyType;
  const raw = Array.isArray(queryVal) ? (queryVal[0] ?? "") : (queryVal ?? "");
  const normalized = normalizeDailyType(raw);
  const value = normalized ?? DailyTaskType.DailyTask;
  setCurrentDailyType(value);
  return value;
}

export function getCurrentDailyType(): DailyTaskTypeValue {
  const stored = readStoredDailyType();
  if (stored) {
    return stored;
  }
  setCurrentDailyType(DailyTaskType.DailyTask);
  return DailyTaskType.DailyTask;
}
