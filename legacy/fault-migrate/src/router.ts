import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: "/faultList",
    name: '故障单',
    component: () => import("@/views/fault/faultList/list.vue"),
  },
  {
    path: "/faultRecord",
    name: '报修记录',
    component: () => import("@/views/fault/faultRecord/record.vue"),
  },
  // {
  //   path: "/faultDetails",
  //   name: '故障单详情',
  //   component: () => import("@/views/fault/faultList/details.vue"),
  // },
  // {
  //   path: "/faultOrder",
  //   name: '故障工单',
  //   component: () => import("@/views/fault/faultOrder/list.vue"),
  // },
  // {
  //   path: "/faultOrderDetails",
  //   name: '故障工单详情',
  //   component: () => import("@/views/fault/faultOrder/details.vue"),
  // },
  {
    path: "/faultReport",
    name: '故障报告',
    component: () => import("@/views/fault/report/index.vue"),
  },
  {
    path: "/faultReportDetail",
    name: '故障报告详情',
    component: () => import("@/views/fault/report/detail.vue"),
  },
  {
    path: "/faultCase",
    name: '故障案例',
    component: () => import("@/views/fault/faultCase/list.vue"),
  },
  {
    path: "/faultCaseOperate",
    name: '故障案例操作',
    component: () => import("@/views/fault/faultCase/operate.vue"),
  },
  // {
  //   path: "/faultTraffic",
  //   name: '故障业务配置',
  //   component: () => import("@/views/fault/config/traffic.vue"),
  // },
  {
    path: "/faultType",
    name: '故障类型',
    component: () => import("@/views/fault/config/type.vue"),
  },
  // {
  //   path: '/messageNotice',
  //   component: () => import("@/views/fault/config/messageNotice.vue"),
  //   name: "messageNotice",
  // },
  {
    path: "/work-order-statistics",
    name: '故障报修工单统计',
    component: () => import("@/views/fault/work-order-statistics/index.vue"),
  },
  {
    path: "/personnel-statistics",
    name: '故障报修人员统计',
    component: () => import("@/views/fault/personnel-statistics/index.vue"),
  },
]