import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/entry",
  },
  {
    path: "/entry",
    name: "Entry",
    component: async () => {
      const { Entry } = await import("./views/entry");
      return Entry;
    },
    meta: {
      title: "安全信用",
      requiresAuth: true,
    },
  },
  {
    path: "/merchant-credit",
    redirect: "/credit",
  },
  {
    path: "/credit",
    name: "CreditHome",
    component: async () => {
      const { CreditHome } = await import("./views/credit-home");
      return CreditHome;
    },
    meta: {
      title: "信用档案",
      requiresAuth: true,
    },
  },
  {
    path: "/behaviors",
    name: "MerchantBehaviorList",
    component: async () => {
      const { MerchantBehaviorList } = await import("./views/merchant-behavior-list");
      return MerchantBehaviorList;
    },
    meta: {
      title: "我的行为记录",
      requiresAuth: true,
    },
  },
  {
    path: "/check-execution",
    name: "CheckExecutionList",
    component: async () => {
      const { CheckExecutionList } = await import("./views/check-execution");
      return CheckExecutionList;
    },
    meta: {
      title: "自查执行",
      requiresAuth: true,
    },
  },
  {
    path: "/check-execution/edit",
    name: "CheckExecutionEdit",
    component: async () => {
      const { CheckExecutionEdit } = await import("./views/check-execution/edit");
      return CheckExecutionEdit;
    },
    meta: {
      title: "安全自查",
      requiresAuth: true,
    },
  },
  {
    path: "/check-execution/detail",
    name: "CheckExecutionDetail",
    component: async () => {
      const { CheckExecutionDetail } = await import("./views/check-execution/detail");
      return CheckExecutionDetail;
    },
    meta: {
      title: "安全自查详情",
      requiresAuth: true,
    },
  },
  {
    path: "/auth/login",
    name: "AuthLogin",
    component: async () => (await import("@ghcloud/cube-h5-auth")).LoginPage,
    meta: {
      title: "登录",
      public: true,
    },
  },
];
