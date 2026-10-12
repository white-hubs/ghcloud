import type { RouteRecordRaw } from "vue-router";

const routers: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/device",
  },
  {
    path: "/index",
    redirect: "/device",
  },
  {
    name: "device",
    path: "/device",
    meta: {
      title: "我的设备",
    },
    component: async () => (await import("@/views/device/device-list/device-list")).DeviceList,
  },
  {
    path: "/device-manual-add",
    name: "DeviceManualAdd",
    meta: {
      title: "手动添加",
    },
    component: async () => (await import("@/views/device/device-manual-add/device-manual-add")).DeviceManualAdd,
  },
  {
    name: "device-product",
    path: "/device-product",
    meta: {
      title: "我的设备",
    },
    component: async () => (await import("@/views/device/device-product/device-product")).DeviceProduct,
  },
  {
    name: "device-detail",
    path: "/device-detail/:id",
    meta: {
      title: "设备详情",
    },
    // component: async () => (await import('@/views/device/device-detail/device-detail')).DeviceDetail
    component: async () => (await import("@/views/device/device-detail/device-detail")).DeviceDetail,
  },
  {
    name: "command",
    path: "/command",
    meta: {
      title: "我的指令",
    },
    component: async () => (await import("@/views/command/command-list/command-list")).CommandList,
  },
  {
    path: "/command-create",
    component: () => import("@/views/command/command-create/command-create").then((m) => m.CommandCreate),
    meta: { title: "创建指令" },
  },
  {
    name: "command-time-select",
    path: "/command-time-select",
    component: () => import("@/views/command/command-time-select/command-time-select").then((m) => m.CommandTimeSelect),
    meta: { title: "选择时间" },
  },
  {
    name: "command-status-select",
    path: "/command-status-select",
    component: () => import("@/views/command/command-status-select/command-status-select").then((m) => m.CommandStatusSelect),
    meta: { title: "选择时间" },
  },
  {
    name: "command-action-select",
    path: "/command-action-select",
    component: () => import("@/views/command/command-action-select/command-action-select").then((m) => m.CommandActionSelect),
    meta: { title: "选择动作" },
  },
  {
    name: "command",
    path: "/command",
    meta: {
      title: "指令",
    },
    component: async () => (await import("@/views/command/command-list/command-list")).CommandList,
  },
  {
    path: "/command-create",
    component: () => import("@/views/command/command-create/command-create").then((m) => m.CommandCreate),
    meta: { title: "创建指令" },
  },
  {
    path: "/command-time-select",
    component: () => import("@/views/command/command-time-select/command-time-select").then((m) => m.CommandTimeSelect),
    meta: { title: "选择时间" },
  },
  {
    path: "/command-status-select",
    component: () => import("@/views/command/command-status-select/command-status-select").then((m) => m.CommandStatusSelect),
    meta: { title: "选择时间" },
  },
  {
    path: "/command-action-select",
    component: () => import("@/views/command/command-action-select/command-action-select").then((m) => m.CommandActionSelect),
    meta: { title: "选择动作" },
  },
  {
    name: "group",
    path: "/group",
    meta: {
      title: "分组管理",
    },
    component: async () => (await import("@/views/group/group")).Group,
  },
  {
    name: "log",
    path: "/log",
    meta: {
      title: "日志管理",
    },
    component: async () => (await import("@/views/log/log-list/log-list")).LogList,
  },
  {
    name: "task",
    path: "/task",
    meta: {
      title: "定时任务",
    },
    component: async () => (await import("@/views/task/task-list/task-list.tsx")).TaskList,
  },
  {
    name: "task-form",
    path: "/task-form",
    meta: {
      title: "定时任务",
    },
    component: () => import("@/views/task/task-form/task-form").then((m) => m.TaskForm),
  },
  {
    name: "device-select",
    path: "/device-select",
    meta: {
      title: "选择设备",
    },
    component: () => import("@/views/device/device-select/device-select").then((m) => m.DeviceSelect),
  },
];
export const routes: RouteRecordRaw[] = [...routers];
