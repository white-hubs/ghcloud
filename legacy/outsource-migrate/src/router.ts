import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/repairList',
    component: () => import("@/views/repair/repairList/list.vue"),
    name: "委外维修单",
    meta: {
      title: "委外维修单",
      keepAlive: true,
    },
  },
  {
    path: '/repairListDetails',
    component: () => import("@/views/repair/repairList/details.vue"),
    name: "委外维修单详情",
    meta: {
      title: "委外维修单详情",
      keepAlive: true,
    },
  },
  {
    path: '/repairOrder',
    component: () => import("@/views/repair/repairOrder/list.vue"),
    name: "委外工单",
    meta: {
      title: "委外工单",
      keepAlive: true,
    },
  },
  {
    path: '/repairOrderDetails',
    component: () => import("@/views/repair/repairOrder/details.vue"),
    name: "委外工单详情",
    meta: {
      title: "委外工单详情",
      keepAlive: true,
    },
  },
  {
    path: '/repairMode',
    component: () => import("@/views/repair/config/mode.vue"),
    name: "委外模式",
    meta: {
      title: "委外模式",
      keepAlive: true,
    },
  },
  {
    path: '/repairCompany',
    component: () => import("@/views/repair/config/company.vue"),
    name: "委外公司",
    meta: {
      title: "委外公司",
      keepAlive: true,
    },
  },
  {
    path: '/repairDevice',
    component: () => import("@/views/repair/config/device.vue"),
    name: "委外设备",
    meta: {
      title: "委外设备",
      keepAlive: true,
    },
  },
  {
    path: '/repairTraffic',
    component: () => import("@/views/repair/config/traffic.vue"),
    name: "委外业务配置",
    meta: {
      title: "委外业务配置",
      keepAlive: true,
    },
  },
  {
    path: '/messageNotice',
    component: () => import("@/views/repair/config/messageNotice.vue"),
    name: "委外消息通知",
    meta: {
      title: "委外消息通知",
      keepAlive: true,
    },
  },
]