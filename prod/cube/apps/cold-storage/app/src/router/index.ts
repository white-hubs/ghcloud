import type { RouteRecordRaw } from "vue-router";

/**
 * 冷库安全 PC 端路由。
 *
 * `meta.title` 是独立运行时的兜底标题；接入主应用后会被菜单配置覆盖。
 */
export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/statistics-dashboard",
  },
  {
    path: "/cold-storage-management",
    name: "cold-storage-management",
    meta: { title: "冷库管理" },
    component: async () => (await import("@/views/cold-storage/management")).ColdStorageManagement,
  },
  {
    path: "/cold-storage-management/detail",
    name: "cold-storage-management-detail",
    meta: { title: "冷库详情" },
    component: async () => (await import("@/views/cold-storage/management/detail-page")).ColdStorageManagementDetailPage,
  },
  {
    path: "/cold-storage-management/create",
    name: "cold-storage-management-create",
    meta: { title: "新增冷库" },
    component: async () => (await import("@/views/cold-storage/management/form-page")).ColdStorageManagementFormPage,
  },
  {
    path: "/cold-storage-management/edit",
    name: "cold-storage-management-edit",
    meta: { title: "编辑冷库" },
    component: async () => (await import("@/views/cold-storage/management/form-page")).ColdStorageManagementFormPage,
  },
  {
    path: "/monitoring",
    name: "monitoring",
    meta: { title: "监测感知" },
    component: async () => (await import("@/views/cold-storage/monitoring")).MonitoringPage,
  },
  {
    path: "/monitoring/detail",
    name: "monitoring-detail",
    meta: { title: "监测感知详情" },
    component: async () => (await import("@/views/cold-storage/monitoring/detail-page")).MonitoringDetailPage,
  },
  {
    path: "/leak-response",
    name: "leak-response",
    meta: { title: "泄漏响应" },
    component: async () => (await import("@/views/cold-storage/leak-response")).LeakResponsePage,
  },
  {
    path: "/refrigeration-analysis/detail",
    name: "refrigeration-analysis-detail",
    meta: { title: "制冷机组详情" },
    component: async () => (await import("@/views/cold-storage/refrigeration-analysis/detail-page")).RefrigerationAnalysisDetailPage,
  },
  {
    path: "/refrigeration-analysis",
    name: "refrigeration-analysis",
    meta: { title: "制冷分析" },
    component: async () => (await import("@/views/cold-storage/refrigeration-analysis")).RefrigerationAnalysisPage,
  },
  {
    path: "/indoor-management/detail",
    name: "indoor-management-detail",
    meta: { title: "库内管理详情" },
    component: async () => (await import("@/views/cold-storage/indoor-management/detail-page")).IndoorManagementDetailPage,
  },
  {
    path: "/indoor-management",
    name: "indoor-management",
    meta: { title: "库内管理" },
    component: async () => (await import("@/views/cold-storage/indoor-management")).IndoorManagementPage,
  },
  {
    path: "/statistics-dashboard",
    name: "statistics-dashboard",
    meta: { title: "统计看板" },
    component: async () => (await import("@/views/cold-storage/statistics-dashboard")).StatisticsDashboardPage,
  },
];
