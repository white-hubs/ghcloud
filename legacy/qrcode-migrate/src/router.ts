import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/businessSettings",
    component: () => import("@/views/businessSettings/list.vue"),
    name: "业务设置",
    meta: {
      title: "业务设置",
      keepAlive: true,
    },
  },
  {
    path: "/qrManagement",
    component: () => import("@/views/qrManagement/List.vue"),
    name: "二维码管理",
    meta: {
      title: "二维码管理",
      keepAlive: true,
    },
  },
  {
    path: "/editQr",
    component: () => import("@/views/qrManagement/Add.vue"),
    name: "新增二维码",
    meta: {
      title: "新增二维码",
      keepAlive: true,
    },
  },
  {
    path: "/qrStyleManagement",
    component: () => import("@/views/qrStyle/List.vue"),
    name: "二维码样式管理",
    meta: {
      title: "二维码样式管理",
      keepAlive: true,
    },
  },
  {
    path: "/editQrStyle",
    component: () => import("@/views/qrStyle/Add.vue"),
    name: "新增二维码样式",
    meta: {
      title: "新增二维码样式",
      keepAlive: true,
    },
  },
  {
    path: "/commonConfig",
    component: () => import("@/views/common-config/common-config.vue"),
    name: "通用配置",
    meta: {
      title: "通用配置",
      keepAlive: true,
    },
  },
  {
    path: "/cloudQrConfig",
    component: () => import("@/views/common-config/cloud-qr-config.vue"),
    name: "云服务配置",
    meta: {
      title: "云服务配置",
      keepAlive: true,
    },
  },
];
