import type { RouteRecordRaw } from "vue-router";

/**
 * 隐患治理 PC 端路由。
 *
 * 页面顺序对齐产品原型导航：
 * 我的待办 → 隐患台账 → 整改任务/表单 → 方案审批 → 整改验收 → 看板/根因 → 规则配置。
 * `meta.title` 是独立运行时的兜底标题；接入主应用后会被菜单配置覆盖。
 */
export const routes: RouteRecordRaw[] = [
  {
    name: "hazard-ledger",
    path: "/hazard-ledger",
    meta: { title: "隐患台账" },
    component: async () => (await import("@/views/hazard/ledger")).HazardLedger,
  },
  {
    name: "hazard-ledger-detail",
    path: "/hazard-ledger-detail",
    meta: { title: "隐患详情" },
    component: async () => (await import("@/views/hazard/ledger-detail")).HazardLedgerDetail,
  },
  {
    name: "rectification-tasks",
    path: "/rectification-tasks",
    meta: { title: "任务列表" },
    component: async () => (await import("@/views/hazard/rectification-tasks")).RectificationTasks,
  },
  {
    name: "rectification-form",
    path: "/rectification-form",
    meta: { title: "整改表单" },
    component: async () => (await import("@/views/hazard/rectification-form")).RectificationForm,
  },
  {
    name: "rectification-progress",
    path: "/rectification-progress",
    meta: { title: "整改进度" },
    component: async () => (await import("@/views/hazard/rectification-progress")).RectificationProgress,
  },
  {
    name: "approval-list",
    path: "/approval-list",
    meta: { title: "审批列表" },
    component: async () => (await import("@/views/hazard/approval-list")).ApprovalList,
  },
  {
    name: "approval-detail",
    path: "/approval-detail",
    meta: { title: "审批详情" },
    component: async () => (await import("@/views/hazard/approval-detail")).ApprovalDetail,
  },
  {
    name: "acceptance-list",
    path: "/acceptance-list",
    meta: { title: "验收列表" },
    component: async () => (await import("@/views/hazard/acceptance-list")).AcceptanceList,
  },
  {
    name: "acceptance-detail",
    path: "/acceptance-detail",
    meta: { title: "验收详情" },
    component: async () => (await import("@/views/hazard/acceptance-detail")).AcceptanceDetail,
  },
  {
    name: "hazard-workbench",
    path: "/hazard-workbench",
    meta: { title: "我的待办" },
    component: async () => (await import("@/views/hazard/workbench")).HazardWorkbench,
  },
  {
    name: "hazard-dashboard",
    path: "/hazard-dashboard",
    meta: { title: "隐患看板" },
    component: async () => (await import("@/views/hazard/dashboard")).HazardDashboard,
  },
  {
    name: "root-cause-list",
    path: "/root-cause-list",
    meta: { title: "根因分析" },
    component: async () => (await import("@/views/hazard/root-cause-list")).RootCauseList,
  },
  {
    name: "root-cause-detail",
    path: "/root-cause-detail",
    meta: { title: "根因详情" },
    component: async () => (await import("@/views/hazard/root-cause-detail")).RootCauseDetail,
  },
  {
    name: "rule-config",
    path: "/rule-config",
    meta: { title: "类型配置" },
    component: async () => (await import("@/views/hazard/rule-config")).RuleConfig,
  },
  {
    name: "approval-template-config",
    path: "/approval-template-config",
    meta: { title: "审批链模板管理" },
    component: async () => (await import("@/views/hazard/approval-template-config")).ApprovalTemplateConfig,
  },
];
