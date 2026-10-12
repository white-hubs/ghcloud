import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: "/alarmLevel",
    name: "报警级别",
    component: () => import("@/views/alarm/alarmLevel.vue"),
    meta: {
      title: "报警级别",
      keepAlive: true,
    },
  },
  {
    path: "/alarmType",
    name: "报警类型",
    component: () => import("@/views/alarm/alarmType.vue"),
    meta: {
      title: "报警类型",
      keepAlive: true,
    },
  },
  {
    path: "/alarmRecord",
    name: "报警记录",
    component: () => import("@/views/alarm/alarmRecord.vue"),
    meta: {
      title: "报警记录",
      keepAlive: true,
    },
  },
  {
    path: "/alarmReason",
    name: "报警原因",
    component: () => import("@/views/alarm/alarm-reason.vue"),
    meta: {
      title: "报警原因",
      keepAlive: true,
    },
  },
  {
    path: "/alarmOverview",
    name: "报警总览",
    component: () => import("@/views/alarm/alarmOverview.vue"),
    meta: {
      title: "报警总览",
      keepAlive: true,
    },
  },
  {
    path: "/alarmSound",
    name: "报警音频",
    component: () => import("@/views/alarmSound/alarmSound.vue"),
    meta: {
      title: "报警音频",
      keepAlive: true,
    },
  },
  {
    path: "/alarm-handle-config",
    name: "报警处理配置",
    component: () => import("@/views/alarm/alarm-handle-config.vue"),
    meta: {
      title: "报警处理配置",
      keepAlive: true,
    },
  },
]