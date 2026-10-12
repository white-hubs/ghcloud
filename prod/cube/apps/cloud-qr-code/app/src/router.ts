import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/cloud-qrcode-list",
    name: "cloud-qrcode-list",
    meta: {
      title: "二维码列表",
    },
    component: async () => (await import("@/views/qrcode-list/qrcode-list")).CloudQrCodeList,
  },
  {
    path: "/cloud-qrcode-edit",
    name: "cloud-qrcode-edit",
    meta: {
      title: "二维码编辑",
    },
    component: async () => (await import("@/views/qrcode-list/qrcode-edit/qrcode-edit")).QrCodeEdit,
  },
  {
    path: "/cloud-qrcode-type-list",
    name: "cloud-qrcode-type-list",
    meta: {
      title: "二维码类型列表",
    },
    component: async () => (await import("@/views/qrcode-type/qrcode-type")).CloudQrCodeTypeList,
  },
  {
    path: "/cloud-qrcode-type-edit",
    name: "cloud-qrcode-type-edit",
    meta: {
      title: "二维码类型编辑",
    },
    component: async () => (await import("@/views/qrcode-type/qrcode-type-edit/qrcode-type-edit")).QrCodeTypeEdit,
  },
  {
    path: "/project-list",
    name: "project-list",
    meta: {
      title: "项目列表",
    },
    component: async () => (await import("@/views/project/project-list")).ProjectList,
  },
  {
    path: "/project-edit",
    name: "project-edit",
    meta: {
      title: "项目编辑",
    },
    component: async () => (await import("@/views/project/project-edit/project-edit")).ProjectEdit,
  },
];
