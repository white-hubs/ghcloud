import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/opinions" },
  {
    name: "opinions",
    path: "/opinions",
    meta: { title: "舆情列表" },
    component: async () => (await import("@/views/opinion-list/opinion-list")).OpinionListPage,
  },
  {
    name: "alerts",
    path: "/alerts",
    meta: { title: "预警管理" },
    component: async () => (await import("@/views/alert-management/alert-management")).AlertManagementPage,
  },
  {
    name: "sources",
    path: "/sources",
    meta: { title: "信源管理" },
    component: async () => (await import("@/views/source-management/source-management")).SourceManagementPage,
  },
  {
    name: "keywords",
    path: "/keywords",
    meta: { title: "关键词配置" },
    component: async () => (await import("@/views/keyword-config/keyword-config")).KeywordConfigPage,
  },
  {
    name: "statistics",
    path: "/statistics",
    meta: { title: "统计分析" },
    component: async () => (await import("@/views/statistics/statistics")).StatisticsPage,
  },
  {
    name: "review-reports",
    path: "/review-reports",
    meta: { title: "复盘报告" },
    component: async () => (await import("@/views/review-report/review-report")).ReviewReportPage,
  },
  {
    name: "recycle-bin",
    path: "/recycle-bin",
    meta: { title: "回收站" },
    component: async () => (await import("@/views/recycle-bin/recycle-bin")).RecycleBinPage,
  },
];
