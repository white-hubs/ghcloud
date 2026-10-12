import { secureExamRouters } from "./secure-exam";
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
    component: async () => (await import("@/views/entry/entry")).Entry,
  },
  {
    name: "auth-login",
    path: "/auth/login",
    component: async () => (await import("@ghcloud/cube-h5-auth")).LoginPage,
    meta: {
      title: "登录",
      public: true,
    },
  },
  {
    name: "qrcode-transfer-add",
    path: "/qrcode-transfer-add",
    component: async () => (await import("@/views/qrcode-transfer/add")).SecureEduAdd,
  },
  {
    name: "qrcode-transfer-list",
    path: "/qrcode-transfer-list",
    component: async () => (await import("@/views/qrcode-transfer/list")).SecureEduList,
  },
  {
    path: "/train-list",
    redirect: "/educationTaskList",
  },
  {
    name: "train-list",
    path: "/educationTaskList",
    component: async () => (await import("@/views/train/train-list")).TrainList,
    meta: {
      title: "培训列表",
    },
  },
  {
    name: "train-sign-in",
    path: "/train-sign-in",
    component: async () => (await import("@/views/train/train-sign-in")).TrainSignIn,
    meta: {
      title: "签到",
    },
  },
  {
    name: "train-detail",
    path: "/train-detail",
    component: async () => (await import("@/views/train/train-detail/index")).TrainDetail,
    meta: {
      title: "培训详情",
    },
  },
  ...secureExamRouters,
];

export const routes: RouteRecordRaw[] = [...routers];
