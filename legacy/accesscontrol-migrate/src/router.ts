import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/accessView",
    component: () => import("@/views/pages/accessView.vue"),
    name: "门禁概览",
    meta: {
      title: "门禁概览",
      keepAlive: true,
    },
  },
  {
    path: "/accessMonitor",
    component: () => import("@/views/pages/accessMonitor.vue"),
    name: "门禁监控",
    meta: {
      title: "门禁监控",
      keepAlive: true,
    },
  },
  {
    path: "/accessDevice",
    component: () => import("@/views/pages/accessDevice.vue"),
    name: "门禁设备",
    meta: {
      title: "门禁设备",
      keepAlive: true,
    },
  },
  {
    path: "/accessRecords",
    component: () => import("@/views/pages/accessRecords.vue"),
    name: "通行记录",
    meta: {
      title: "通行记录",
      keepAlive: true,
    },
  },
  {
    path: "/abnormalEvents",
    component: () => import("@/views/pages/abnormalEvents.vue"),
    name: "异常事件",
    meta: {
      title: "异常事件",
      keepAlive: true,
    },
  },
  {
    path: "/roomHome",
    component: () => import("@/views/pages/roomHome.vue"),
    name: "门禁总览",
    meta: {
      title: "门禁总览",
      keepAlive: true,
    },
  },
  {
    path: "/roomDevicePage",
    component: () => import("@/views/pages/roomDevicePage.vue"),
    name: "门禁设备",
    meta: {
      title: "门禁设备",
      keepAlive: true,
    },
  },
  {
    path: "/roomLogPage",
    component: () => import("@/views/pages/roomLogPage.vue"),
    name: "通行记录",
    meta: {
      title: "通行记录",
      keepAlive: true,
    },
  },
  {
    path: "/roomLinkagePage",
    component: () => import("@/views/pages/roomLinkagePage.vue"),
    name: "门禁联动",
    meta: {
      title: "门禁联动",
      keepAlive: true,
    },
  },
  {
    path: "/roomLinkagePage/:id",
    component: () => import("@/views/pages/roomLinkageDetail.vue"),
    name: "门禁联动详情",
    meta: {
      title: "门禁联动详情",
      keepAlive: false,
    },
  },
  {
    path: "/roomLinkagePage/:id/edit",
    component: () => import("@/views/pages/roomLinkageEdit.vue"),
    name: "编辑门禁联动",
    meta: {
      title: "编辑门禁联动",
      keepAlive: false,
    },
  },
  {
    path: "/roomEventPage",
    component: () => import("@/views/pages/roomEventPage.vue"),
    name: "异常事件",
    meta: {
      title: "异常事件",
      keepAlive: true,
    },
  },
];
