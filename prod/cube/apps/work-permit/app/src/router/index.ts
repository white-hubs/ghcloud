import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    name: "work-permit-redirect",
    path: "/",
    redirect: "/work-permit-type-config",
  },
  {
    name: "work-permit-type-config",
    path: "/work-permit-type-config",
    meta: { title: "作业类型配置" },
    component: async () => (await import("@/views/work-permit-type-config/work-permit-type-config")).WorkPermitTypeConfig,
  },
  {
    name: "work-permit-type-form",
    path: "/work-permit-type-form",
    meta: { title: "作业类型" },
    component: async () => (await import("@/views/work-permit-type-form/work-permit-type-form")).WorkPermitTypeForm,
  },
  {
    name: "work-order-library",
    path: "/work-order-library",
    meta: { title: "作业库" },
    component: async () => (await import("@/views/work-order-library/work-order-library")).WorkOrderLibrary,
  },
  {
    name: "work-order-config",
    path: "/work-order-config",
    meta: { title: "作业配置" },
    component: async () => (await import("@/views/work-order-config/work-order-config")).WorkOrderConfig,
  },
  {
    name: "work-order-approval",
    path: "/work-order-approval",
    meta: { title: "作业审批" },
    component: async () => (await import("@/views/work-order-approval/work-order-approval")).WorkOrderApproval,
  },
  {
    name: "work-order-record",
    path: "/work-order-record",
    meta: { title: "作业记录" },
    component: async () => (await import("@/views/work-order-record/work-order-record")).WorkOrderRecord,
  },
  {
    name: "work-order-statistics",
    path: "/work-order-statistics",
    meta: { title: "作业统计" },
    component: async () => (await import("@/views/work-order-statistics/work-order-statistics")).WorkOrderStatistics,
  },
];
