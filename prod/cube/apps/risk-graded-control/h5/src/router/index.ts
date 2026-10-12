import type { RouteRecordRaw } from "vue-router";

const routers: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/entry",
  },
  {
    name: "entry",
    path: "/entry",
    meta: {
      title: "风险分级管控",
    },
    component: async () => (await import("@/views/entry/entry")).Entry,
  },
  {
    name: "measure-execution",
    path: "/measure-execution",
    redirect: "/measures/execution",
  },
  {
    name: "measureExecution",
    path: "/measures/execution",
    meta: {
      title: "措施执行",
      isFilter: true,
      description: "措施执行",
    },
    component: async () => (await import("@/views/measure-execution/measure-execution")).MeasureExecutionPage,
  },
  {
    name: "identifications",
    path: "/identifications",
    meta: {
      title: "风险辨识管理",
      isFilter: true,
      description: "风险辨识",
    },
    component: async () => (await import("@/views/identification/identification-list")).IdentificationListPage,
  },
  {
    name: "identification-entry",
    path: "/identifications/entry",
    meta: {
      title: "风险辨识",
    },
    component: async () => (await import("@/views/identification/identification-entry")).IdentificationEntryPage,
  },
  {
    name: "asset-picker",
    path: "/identifications/asset-picker",
    meta: {
      title: "选择关联资产",
    },
    component: async () => (await import("@/views/asset-picker/asset-picker")).AssetPickerPage,
  },
  {
    name: "identification-detail",
    path: "/identifications/detail",
    meta: {
      title: "辨识详情",
    },
    component: async () => (await import("@/views/identification/identification-detail")).IdentificationDetailPage,
  },
  {
    name: "reviewPending",
    path: "/reviews/pending",
    meta: {
      title: "风险辨识审核",
      isFilter: true,
      description: "辨识审核",
    },
    component: async () => (await import("@/views/review/review-pending")).ReviewPendingPage,
  },
  {
    name: "assessmentList",
    path: "/assessments",
    meta: {
      title: "风险评估管理",
      isFilter: true,
      description: "风险评估",
    },
    component: async () => (await import("@/views/assessment/assessment-list")).AssessmentListPage,
  },
  {
    name: "assessmentDetail",
    path: "/assessments/detail",
    meta: {
      title: "风险评估详情",
      description: "评估录入",
    },
    component: async () => (await import("@/views/assessment/assessment-detail")).AssessmentDetailPage,
  },
];

export const routes: RouteRecordRaw[] = [...routers];
