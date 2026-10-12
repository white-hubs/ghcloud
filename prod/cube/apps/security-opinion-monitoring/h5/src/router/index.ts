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
      title: "安全舆情",
    },
    component: async () => (await import("@/views/entry/entry")).Entry,
  },
  {
    name: "opinions",
    path: "/opinions",
    meta: {
      title: "舆情列表",
      isFilter: true,
    },
    component: async () => (await import("@/views/opinion-list/opinion-list")).OpinionListPage,
  },
  {
    name: "opinionDetail",
    path: "/opinions/:id",
    meta: {
      title: "舆情详情",
    },
    component: async () => (await import("@/views/opinion-detail/opinion-detail")).OpinionDetailPage,
  },
  {
    name: "alerts",
    path: "/alerts",
    meta: {
      title: "预警管理",
      isFilter: true,
    },
    component: async () => (await import("@/views/alert-management/alert-management")).AlertManagementPage,
  },
  {
    name: "reviewReports",
    path: "/review-reports",
    meta: {
      title: "复盘报告",
      isFilter: true,
    },
    component: async () => (await import("@/views/review-report/review-report")).ReviewReportPage,
  },
];

export const routes: RouteRecordRaw[] = [...routers];
