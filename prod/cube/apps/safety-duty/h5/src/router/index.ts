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
      title: "安全履职",
    },
    component: async () => (await import("@/views/entry/entry")).Entry,
  },
  {
    name: "myAssignment",
    path: "/my-assignment",
    meta: {
      title: "我的责任清单",
    },
    component: async () => (await import("@/views/my-assignment/my-assignment")).MyAssignmentPage,
  },
  {
    name: "signConfirmation",
    path: "/sign-confirmation",
    meta: {
      title: "待签收",
    },
    component: async () => (await import("@/views/sign-confirmation/sign-confirmation")).SignConfirmationPage,
  },
  {
    name: "scoreReport",
    path: "/score-report",
    meta: {
      title: "个人履职报告",
    },
    component: async () => (await import("@/views/score-report/score-report")).ScoreReportPage,
  },
  {
    name: "scoreDashboard",
    path: "/score-dashboard",
    meta: {
      title: "评分看板",
    },
    component: async () => (await import("@/views/score-dashboard/score-dashboard")).ScoreDashboardPage,
  },
  {
    name: "scorePublicity",
    path: "/score-publicity",
    meta: {
      title: "排名公示",
    },
    component: async () => (await import("@/views/score-publicity/score-publicity")).ScorePublicityPage,
  },
  {
    name: "complianceReport",
    path: "/compliance-report",
    meta: {
      title: "合规报告",
    },
    component: async () => (await import("@/views/compliance-report/compliance-report")).ComplianceReportPage,
  },
];

export const routes: RouteRecordRaw[] = [...routers];
