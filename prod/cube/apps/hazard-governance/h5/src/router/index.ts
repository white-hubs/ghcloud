import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/entry",
  },
  {
    name: "entry",
    path: "/entry",
    meta: {
      title: "隐患治理",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/entry/entry")).Entry,
  },
  {
    name: "todo",
    path: "/todo",
    meta: {
      title: "我的待办",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/todo")).TodoPage,
  },
  {
    name: "hazards",
    path: "/hazards",
    meta: {
      title: "隐患台账",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/hazard-ledger")).HazardLedgerPage,
  },
  {
    name: "hazard-report",
    path: "/hazard-report",
    meta: {
      title: "隐患智能上报",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/hazard-report")).HazardReportPage,
  },
  {
    name: "tasks",
    path: "/tasks",
    meta: {
      title: "整改任务",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/task-list")).TaskListPage,
  },
  {
    name: "rectification-form",
    path: "/rectification-form",
    meta: {
      title: "整改表单",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/rectification-form")).RectificationFormPage,
  },
  {
    name: "approvals",
    path: "/approvals",
    meta: {
      title: "审批列表",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/approval-list")).ApprovalListPage,
  },
  {
    name: "approval-detail",
    path: "/approval-detail",
    meta: {
      title: "审批详情",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/approval-detail")).ApprovalDetailPage,
  },
  {
    name: "acceptances",
    path: "/acceptances",
    meta: {
      title: "验收列表",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/acceptance-list")).AcceptanceListPage,
  },
  {
    name: "acceptance-detail",
    path: "/acceptance-detail",
    meta: {
      title: "验收详情",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/acceptance-detail")).AcceptanceDetailPage,
  },
];
