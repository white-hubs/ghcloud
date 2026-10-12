import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/works",
  },
  {
    name: "fumigation-work-list",
    path: "/works",
    meta: { title: "作业列表" },
    component: async () => (await import("@/views/fumigation/work-list")).FumigationWorkList,
  },
  {
    name: "fumigation-work-create",
    path: "/works/create",
    meta: { title: "新增熏蒸" },
    component: async () => (await import("@/views/fumigation/work-form")).FumigationWorkCreate,
  },
  {
    name: "fumigation-approval",
    path: "/approval",
    meta: { title: "审批页面" },
    component: async () => (await import("@/views/fumigation/approval-detail")).FumigationApprovalDetail,
  },
  {
    name: "fumigation-precheck",
    path: "/precheck",
    meta: { title: "三步校验" },
    component: async () => (await import("@/views/fumigation/precheck")).FumigationPrecheck,
  },
  {
    name: "fumigation-monitor",
    path: "/monitor",
    meta: { title: "监护看板" },
    component: async () => (await import("@/views/fumigation/monitor-board")).FumigationMonitorBoard,
  },
  {
    name: "fumigation-realtime",
    path: "/realtime",
    meta: { title: "实时态势" },
    component: async () => (await import("@/views/fumigation/realtime-situation")).FumigationRealtimeSituation,
  },
  {
    name: "fumigation-archive",
    path: "/archive",
    meta: { title: "合规档案" },
    component: async () => (await import("@/views/fumigation/compliance-archive")).FumigationComplianceArchive,
  },
  {
    name: "fumigation-archive-document",
    path: "/archive/document/:archiveId",
    meta: { title: "合规档案" },
    component: async () => (await import("@/views/fumigation/archive-document")).FumigationArchiveDocumentPage,
  },
];
