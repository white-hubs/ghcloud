import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/entry",
  },
  {
    name: "entry",
    path: "/entry",
    meta: {
      title: "冷库管理",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/entry")).Entry,
  },
  {
    name: "monitoring",
    path: "/monitoring",
    meta: {
      title: "监测感知",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/monitoring")).MonitoringPage,
  },
  {
    name: "monitoring-detail",
    path: "/monitoring/detail",
    meta: {
      title: "监测感知详情",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/monitoring/detail")).MonitoringDetailPage,
  },
  {
    name: "leak-response",
    path: "/leak-response",
    meta: {
      title: "泄漏响应",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/leak-response")).LeakResponsePage,
  },
  {
    name: "leak-response-detail",
    path: "/leak-response/detail",
    meta: {
      title: "泄漏报警详情",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/leak-response/detail")).LeakResponseDetailPage,
  },
  {
    name: "baseAlarmRecords",
    path: "/baseAlarmRecords",
    redirect: (to) => ({
      path: "/alarm-list",
      query: to.query,
    }),
  },
  {
    name: "alarm-list",
    path: "/alarm-list",
    meta: {
      title: "报警记录",
      requiresAuth: true,
    },
    component: async () => (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-records")).AlarmRecords,
  },
  {
    name: "alarm-details",
    path: "/alarm-details",
    meta: {
      title: "报警详情",
      requiresAuth: true,
    },
    component: async () => (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/details/details")).Details,
  },
  {
    name: "alarm-handle",
    path: "/alarm-handle",
    meta: {
      title: "报警处理",
      requiresAuth: true,
    },
    component: async () => (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-handle/alarm-handle")).AlarmHandle,
  },
  {
    name: "alarm-transfer",
    path: "/alarm-transfer",
    meta: {
      title: "报警移交",
      requiresAuth: true,
    },
    component: async () =>
      (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-transfer/alarm-transfer")).AlarmTransfer,
  },
  {
    name: "alarm-follow-up",
    path: "/alarm-follow-up",
    meta: {
      title: "报警跟进",
      requiresAuth: true,
    },
    component: async () =>
      (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-follow-up/alarm-follow-up")).AlarmFollowUp,
  },
  {
    path: "/auth/login",
    meta: {
      title: "登录",
      public: true,
    },
    component: async () => (await import("@ghcloud/cube-h5-auth")).LoginPage,
  },
];
