import type { RouteRecordRaw } from "vue-router";

export const inspectConfig: RouteRecordRaw[] = [
  {
    path: "/inspect-cycle",
    name: "InspectCycle",
    meta: {
      title: "巡检周期",
    },
    component: async () => (await import("@/views/inspect-config/inspect-cycle/inspect-cycle")).InspectCycle,
  },
  {
    path: "/inspect-result",
    name: "InspectResult",
    meta: {
      title: "巡检结果",
    },
    component: async () => (await import("@/views/inspect-config/inspect-result/inspect-result")).InspectResult,
  },
  {
    path: "/inspect-items",
    name: "InspectItems",
    meta: {
      title: "巡检项",
    },
    component: async () => (await import("@/views/inspect-config/inspect-items/inspect-items")).InspectItems,
  },
  {
    path: "/inspect-items-form",
    name: "InspectItemsForm",
    meta: {
      title: "巡检项",
    },
    component: async () => (await import("@/views/inspect-config/inspect-items-form/inspect-items-form")).InspectItemsForm,
  },
  {
    path: "/inspect-standard",
    name: "InspectStandard",
    meta: {
      title: "巡检标准",
    },
    component: async () => (await import("@/views/inspect-config/inspect-standard/inspect-standard")).InspectStandard,
  },
  {
    path: "/inspect-standard-form",
    name: "InspectStandardForm",
    meta: {
      title: "巡检标准",
    },
    component: async () => (await import("@/views/inspect-config/inspect-standard-form/inspect-standard-form")).InspectStandardForm,
  },
  {
    path: "/inspect-standard-ai",
    name: "InspectStandardAi",
    meta: {
      title: "AI巡检标准生成",
    },
    component: async () => (await import("@/views/inspect-config/inspect-standard-ai/inspect-standard-ai")).InspectStandardAi,
  },
  {
    path: "/inspect-type",
    name: "inspectType",
    meta: {
      title: "巡检类型",
    },
    component: async () => (await import("@/views/inspect-config/inspect-type/inspect-type")).InspectType,
  },
  {
    path: "/inspect-map-config",
    name: "InspectMapConfig",
    meta: {
      title: "巡检地图配置",
    },
    component: async () => (await import("@/views/inspect-config/inspect-map-config/inspect-map-config")).InspectMapConfig,
  },
];
