import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: "/renovationList",
    name: '更新改造单',
    component: () => import("@/views/renovation/renovationList/list.vue"),
    meta: {
      title: "更新改造单",
      keepAlive: true
    }
  },
  {
    path: "/renovationDetails",
    name: '更新改造单详情',
    component: () => import("@/views/renovation/renovationList/details.vue"),
    meta: {
      title: "更新改造单详情",
      keepAlive: true
    }
  },
  {
    path: "/renovationOrder",
    name: '更新改造工单',
    component: () => import("@/views/renovation/renovationOrder/list.vue"),
    meta: {
      title: "更新改造工单",
      keepAlive: true
    }
  },
  {
    path: "/renovationOrderDetails",
    name: '更新改造工单详情',
    component: () => import("@/views/renovation/renovationOrder/details.vue"),
    meta: {
      title: "更新改造工单详情",
      keepAlive: true
    }
  },
  {
    path: "/renovationTraffic",
    name: '更新改造业务配置',
    component: () => import("@/views/renovation/config/traffic.vue"),
    meta: {
      title: "更新改造业务配置",
      keepAlive: true
    }
  },
  {
    path: "/messageNotice",
    name: '通知配置',
    component: () => import("@/views/renovation/config/messageNotice.vue"),
    meta: {
      title: "通知配置",
      keepAlive: true
    }
  },
]