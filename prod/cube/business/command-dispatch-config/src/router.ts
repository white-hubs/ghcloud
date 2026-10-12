import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    name: "radio-record",
    path: "/radio-record",
    component: async () => (await import("@/views/radio-record")).RadioRecord,
    meta: {
      title: "录音记录",
    },
  },
  {
    name: "intercom-group-config",
    path: "/intercom-group-config",
    component: async () => (await import("@/views/intercom-group-config")).IntercomGroupConfig,
    meta: {
      title: "对讲组配置",
    },
  },
  {
    name: "account-config",
    path: "/account-config",
    component: async () => (await import("@/views/account-config")).AccountConfig,
    meta: {
      title: "账号配置",
    },
  },
  {
    name: "dispatch-map-config",
    path: "/dispatch-map-config",
    component: async () => (await import("@/views/dispatch-map-config")).MapConfig,
    meta: {
      title: "地图配置",
    },
  },
  {
    name: "background-config",
    path: "/background-config",
    component: async () => (await import("@/views/background-config/background-config")).BackgroundConfig,
    meta: {
      title: "背景设置",
    },
  },
  {
    name: "priority-department-config",
    path: "/priority-department-config",
    component: async () => (await import("@/views/priority-department-config")).PriorityDepartmentConfig,
    meta: {
      title: "优先选择部门",
    },
  },
];
