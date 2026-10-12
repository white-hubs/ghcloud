import type { RouteRecordRaw } from "vue-router";

const routers: RouteRecordRaw[] = [
  {
    name: "index",
    path: "/",
    redirect: "/entry",
  },
  {
    name: "entry",
    path: "/entry",
    meta: {
      title: "粮仓管理",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/entry/entry")).Entry,
  },
  {
    name: "auth-login",
    path: "/auth/login",
    meta: {
      title: "登录",
      public: true,
    },
    component: async () => (await import("@ghcloud/cube-h5-auth")).LoginPage,
  },
  {
    name: "grain-monitor-detail",
    path: "/grain-monitor-detail",
    meta: {
      title: "粮情监测详情",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/grain-monitor-detail/grain-monitor-detail")).GrainMonitorDetail,
  },
];

export const routes: RouteRecordRaw[] = [...routers];
