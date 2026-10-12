import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: "/broadcastCenterRecord",
    component: () => import("@/views/pages/broadcastCenterRecord.vue"),
    name: "广播记录",
    meta: {
      title: "广播记录",
      keepAlive: true,
    },
  },
  {
    path: "/broadcastCenterMoban",
    component: () => import("@/views/pages/broadcastCenterMoban.vue"),
    name: "广播模板",
    meta: {
      title: "广播模板",
      keepAlive: true,
    },
  },
  {
    path: "/broadcastCenterRuleList",
    component: () => import("@/views/pages/broadcast-rule/list.vue"),
    name: "广播规则",
    meta: {
      title: "广播规则",
      keepAlive: true,
    },
  },
  {
    path: "/broadcastCenterRuleDetails",
    component: () => import("@/views/pages/broadcast-rule/details.vue"),
    name: "广播规则详情",
    meta: {
      title: "广播规则详情",
      keepAlive: true,
    },
  },
];
