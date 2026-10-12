import type { RouteRecordRaw } from "vue-router";

/** 消防管理 PC 端业务路由。 */
export const routes: RouteRecordRaw[] = [
  {
    name: "fire-management-home",
    path: "/",
    redirect: "/fire-host-control",
  },
  {
    name: "fire-device-list",
    path: "/fire-device-list",
    meta: { title: "消防设备管理" },
    component: async () => (await import("@/views/fire-device-list/fire-device-list")).FireDeviceList,
  },
  {
    name: "fire-host-config",
    path: "/fire-host-config",
    meta: { title: "消防主机配置" },
    component: async () => (await import("@/views/fire-host-config/fire-host-config")).FireHostConfig,
  },
  {
    name: "fire-host-control",
    path: "/fire-host-control",
    meta: { title: "消防主机远程控制" },
    component: async () => (await import("@/views/fire-host-control/fire-host-control")).FireHostControl,
  },
  {
    name: "fire-point-management",
    path: "/fire-point-management",
    meta: { title: "消防配置管理" },
    component: async () => (await import("@/views/fire-point-management/fire-point-management")).FirePointManagement,
  },
  {
    name: "fire-point-statistics",
    path: "/fire-point-statistics",
    meta: { title: "点位统计" },
    component: async () => (await import("@/views/point-statistics/point-statistics")).PointStatistics,
  },
  {
    name: "fire-event-records",
    path: "/fire-event-records",
    meta: { title: "事件记录" },
    component: async () => (await import("@/views/event-records/event-records")).EventRecords,
  },
  {
    name: "fire-operation-records",
    path: "/fire-operation-records",
    meta: { title: "操作记录" },
    component: async () => (await import("@/views/operation-records/operation-records")).OperationRecords,
  },
];
