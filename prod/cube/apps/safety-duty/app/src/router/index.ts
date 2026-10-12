import type { RouteRecordRaw } from "vue-router";

/**
 * 路由表为扁平结构；一级菜单分组由主应用菜单配置负责，此处仅声明可访问页面。
 */
export const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/organization-duty/overview" },
  {
    name: "dutyOverview",
    path: "/organization-duty/overview",
    component: async () => (await import("@/views/overview")).DutyOverviewPage,
  },
  {
    name: "dutyRoleAssignments",
    path: "/organization-duty/role-assignments",
    component: async () => (await import("@/views/role-assignments")).DutyRoleAssignmentsPage,
  },
  {
    name: "dutyTemplates",
    path: "/organization-duty/templates",
    component: async () => (await import("@/views/templates")).DutyTemplatesPage,
  },
  {
    name: "dutyNotificationConfig",
    path: "/organization-duty/notification-config",
    component: async () => (await import("@/views/notification")).DutyNotificationConfigPage,
  },
  {
    name: "dutySignatureTracking",
    path: "/organization-duty/signature-tracking",
    component: async () => (await import("@/views/signature-tracking")).DutySignatureTrackingPage,
  },
  {
    name: "dutyAssignments",
    path: "/organization-duty/assignments",
    component: async () => (await import("@/views/assignments")).DutyAssignmentsPage,
  },
  {
    name: "dutySignConfirmation",
    path: "/organization-duty/sign-confirmation",
    component: async () => (await import("@/views/signature")).DutySignaturePage,
  },
  {
    name: "dutyScoreModel",
    path: "/score/model",
    component: async () => (await import("@/views/score")).DutyScoreModelPage,
  },
  {
    name: "dutyScoreDashboard",
    path: "/score/dashboard",
    component: async () => (await import("@/views/score")).DutyScoreDashboardPage,
  },
  {
    name: "dutyScorePersonalReport",
    path: "/score/personal-report",
    component: async () => (await import("@/views/score")).DutyScorePersonalReportPage,
  },
  {
    name: "dutyScorePublicity",
    path: "/score/publicity",
    component: async () => (await import("@/views/score")).DutyScorePublicityPage,
  },
  {
    name: "dutyScoreNotifyTargets",
    path: "/score/notify-targets",
    component: async () => (await import("@/views/score")).DutyScoreNotifyTargetsPage,
  },
  {
    name: "dutyReportGenerate",
    path: "/reports/generate",
    component: async () => (await import("@/views/reports")).DutyReportsPage,
  },
];
