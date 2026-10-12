import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    name: "point-statistics",
    path: "/fire-point-statistics",
    alias: ["/entry", "/point-statistics"],
    component: async () => (await import("@/views/point-statistics/point-statistics")).PointStatisticsPage,
  },
  {
    name: "event-records",
    path: "/fire-event-records",
    alias: ["/event-records", "/fire-event-record"],
    component: async () => (await import("@/views/event-records/event-records")).EventRecordsPage,
  },
  {
    name: "operation-records",
    path: "/fire-operation-records",
    alias: ["/operation-records", "/fire-operation-record"],
    component: async () => (await import("@/views/operation-records/operation-records")).OperationRecordsPage,
  },
];
