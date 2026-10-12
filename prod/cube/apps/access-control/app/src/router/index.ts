import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/roomHome",
  },
  {
    path: "/accessView",
    name: "门禁概览",
    redirect: "/roomHome",
  },
  {
    path: "/accessMonitor",
    name: "门禁监控",
    redirect: "/roomHome",
  },
  {
    path: "/accessDevice",
    name: "门禁设备",
    redirect: "/roomDevicePage",
  },
  {
    path: "/accessRecords",
    name: "通行记录",
    redirect: "/roomLogPage",
  },
  {
    path: "/abnormalEvents",
    name: "异常事件",
    redirect: "/roomEventPage",
  },
  {
    path: "/roomHome",
    name: "门禁总览",
    meta: { title: "门禁总览", keepAlive: true },
    component: () => import("@/views/pages/room-home"),
  },
  {
    path: "/roomDevicePage",
    name: "门禁设备管理",
    meta: { title: "门禁设备", keepAlive: true },
    component: () => import("@/views/pages/room-device-page"),
  },
  {
    path: "/roomLogPage",
    name: "门禁通行记录",
    meta: { title: "通行记录", keepAlive: true },
    component: () => import("@/views/pages/room-log-page"),
  },
  {
    path: "/roomEventPage",
    name: "门禁异常事件",
    meta: { title: "异常事件", keepAlive: true },
    component: () => import("@/views/pages/room-event-page"),
  },
];
