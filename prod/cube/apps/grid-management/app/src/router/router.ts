import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/grid-list",
    name: "grid-list",
    meta: {
      title: "网格列表",
    },
    component: async () => (await import("@/views/grid-list/grid-list")).GridList,
  },
  {
    path: "/grid-detail",
    name: "grid-detail",
    meta: {
      title: "网格详情",
    },
    component: async () => (await import("@/views/grid-detail/grid-detail")).GridDetail,
  },
  {
    path: "/grid-person-manage",
    name: "grid-person-manage",
    meta: {
      title: "网格人员管理",
    },
    component: async () => (await import("@/views/grid-person/grid-person")).GridPerson,
  },
  {
    path: "/grid-task",
    name: "grid-task",
    meta: {
      title: "网格任务",
    },
    component: async () => (await import("@/views/grid-task/grid-task")).TaskList,
  },
  {
    path: "/grid-model-config",
    name: "grid-model-config",
    meta: {
      title: "网格模型配置",
    },
    component: async () => (await import("@/views/grid-model-config/grid-modal-config")).GridModalConfig,
  },
];
