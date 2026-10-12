import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/power-relation",
    name: "PowerRelation",
    meta: {
      title: "供电关系",
    },
    component: async () => (await import("@/views/power-relation/power-relation")).PowerRelation,
  },
  // 供电拓扑图
  // {
  //   path: '/power-topology',
  //   name: 'PowerTopology',
  //   meta: {
  //     title: '拓扑图'
  //   },
  //   component: async () => (await import('@/views/power-topology/power-topology')).PowerTopology
  // },
  // 线损管理
  {
    path: "/line-loss",
    name: "LineLoss",
    meta: {
      title: "线损管理",
    },
    component: async () => (await import("@/views/line-loss/line-loss")).LineLoss,
  },
  {
    path: "/drawing-management",
    name: "DrawingManagement",
    meta: {
      title: "图纸管理",
    },
    component: async () => (await import("@/views/drawing-management/drawing-management")).DrawingManagement,
  },
  {
    path: "/drawing-management-edit",
    name: "DrawingManagementEdit",
    meta: {
      title: "图纸管理",
    },
    component: async () =>
      (await import("@/views/drawing-management/drawing-management-edit/drawing-management-edit")).DrawingManagementEdit,
  },
  {
    path: "/collection-cycle",
    name: "CollectionCycle",
    meta: {
      title: "采集周期",
    },
    component: async () => (await import("@/views/collection-cycle/collection-cycle")).CollectionCycle,
  },
  {
    path: "/collection-record",
    name: "CollectionRecord",
    meta: {
      title: "采集记录",
    },
    component: async () => (await import("@/views/collection-record/collection-record")).CollectionRecord,
  },
  {
    path: "/loss-statistics",
    name: "LossStatistics",
    meta: {
      title: "损耗统计",
    },
    component: async () => (await import("@/views/loss-statistics/loss-statistics")).LossStatistics,
  },
];
