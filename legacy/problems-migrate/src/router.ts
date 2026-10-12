import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: "/problemsList",
    name: '隐患单',
    component: () => import("@/views/problems/problemsList/list.vue"),
    meta: {
      title: "隐患单",
      keepAlive: true
    }
  },
  {
    path: "/problemsRecord",
    name: '排查记录',
    component: () => import("@/views/problems/problemsRecord/record.vue"),
    meta: {
      title: "排查记录",
      keepAlive: true
    }
  },
  {
    path: "/problemsDetails",
    name: '隐患单详情',
    component: () => import("@/views/problems/problemsList/details.vue"),
    meta: {
      title: "隐患单详情",
      keepAlive: true
    }
  },
  {
    path: "/checkList",
    name: '排查工单',
    component: () => import("@/views/problems/checkList/list.vue"),
    meta: {
      title: "排查工单",
      keepAlive: true
    }
  },
  {
    path: "/checkDetails",
    name: '排查工单详情',
    component: () => import("@/views/problems/checkList/details.vue"),
    meta: {
      title: "排查工单详情",
      keepAlive: true
    }
  },
  {
    path: "/problemsDegree",
    name: '隐患程度',
    component: () => import("@/views/problems/config/degree.vue"),
    meta: {
      title: "隐患程度",
      keepAlive: true
    }
  },
  {
    path: "/problemsTraffic",
    name: '业务配置',
    component: () => import("@/views/problems/config/traffic.vue"),
    meta: {
      title: "业务配置",
      keepAlive: true
    }
  },
  {
    path: "/problemsType",
    name: '隐患类型',
    component: () => import("@/views/problems/config/type.vue"),
    meta: {
      title: "隐患类型",
      keepAlive: true
    }
  },
  {
    path: "/messageNotice",
    name: '消息配置',
    component: () => import("@/views/problems/config/messageNotice.vue"),
    meta: {
      title: "消息配置",
      keepAlive: true
    }
  },
  {
    path: "/work-order-statistics",
    name: '隐患工单统计',
    component: () => import("@/views/problems/work-order-statistics/index.vue"),
  },
  {
    path: "/personnel-statistics",
    name: '隐患人员统计',
    component: () => import("@/views/problems/personnel-statistics/index.vue"),
  },
]