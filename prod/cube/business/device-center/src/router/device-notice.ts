import type { RouteRecordRaw } from "vue-router";

/** 设备通知路由 */
export const deviceNoticeRoutes: RouteRecordRaw[] = [
  {
    path: "/device-notice-config-list",
    name: "DeviceNoticeConfigList",
    component: async () => (await import("@/views/notice/config/device-notice-list")).DeviceNoticeConfig,
  },
  {
    path: "/device-notice-config-detail",
    name: "DeviceNoticeConfigDetail",
    component: async () => (await import("@/views/notice/config/device-notice-config")).DeviceNoticeConfigDetail,
  },
  {
    path: "/device-notice-record-list",
    name: "DeviceNoticeRecordList",
    component: async () => (await import("@/views/notice/record/device-notice-record-list")).DeviceNoticeRecordConfig,
  },
];
