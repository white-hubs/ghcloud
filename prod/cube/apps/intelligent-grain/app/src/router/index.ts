import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/intelligent-grain",
  },
  {
    name: "intelligent-grain-dashboard",
    path: "/intelligent-grain",
    meta: { title: "智能粮情" },
    component: async () => (await import("@/views/dashboard")).IntelligentGrainDashboard,
  },
  {
    name: "intelligent-grain-archive",
    path: "/archives",
    redirect: "/archives/detail",
  },
  {
    name: "intelligent-grain-warehouses",
    path: "/warehouses",
    meta: { title: "仓房管理" },
    component: async () => (await import("@/views/warehouses")).IntelligentGrainWarehouses,
  },
  {
    name: "intelligent-grain-warehouse-detail",
    path: "/warehouses/detail",
    meta: { title: "仓房详情" },
    component: async () => (await import("@/views/warehouses/detail")).IntelligentGrainWarehouseDetail,
  },
  {
    name: "intelligent-grain-varieties",
    path: "/grain-varieties",
    meta: { title: "粮食品种" },
    component: async () => (await import("@/views/grain-varieties")).IntelligentGrainVarieties,
  },
  {
    name: "intelligent-grain-quality-records",
    path: "/quality-records",
    meta: { title: "品质录入" },
    component: async () => (await import("@/views/quality-records")).IntelligentGrainQualityRecords,
  },
  {
    name: "intelligent-grain-archive-detail",
    path: "/archives/detail",
    meta: { title: "档案详情" },
    component: async () => (await import("@/views/archive/detail")).IntelligentGrainArchiveDetail,
  },
  {
    name: "intelligent-grain-archive-trend",
    path: "/archives/trend",
    meta: { title: "趋势曲线" },
    component: async () => (await import("@/views/archive/trend")).IntelligentGrainArchiveTrend,
  },
  {
    name: "intelligent-grain-archive-records",
    path: "/archives/records",
    meta: { title: "数据明细" },
    component: async () => (await import("@/views/archive/records")).IntelligentGrainArchiveRecords,
  },
  {
    path: "/archives/:warehouseId",
    redirect: (to) => ({ name: "intelligent-grain-archive-detail", query: { warehouseId: String(to.params.warehouseId) } }),
  },
  {
    path: "/archives/:warehouseId/trend",
    redirect: (to) => ({ name: "intelligent-grain-archive-trend", query: { warehouseId: String(to.params.warehouseId) } }),
  },
  {
    path: "/archives/:warehouseId/records",
    redirect: (to) => ({ name: "intelligent-grain-archive-records", query: { warehouseId: String(to.params.warehouseId) } }),
  },
  {
    name: "intelligent-grain-rules",
    path: "/rules",
    meta: { title: "规则配置" },
    component: async () => (await import("@/views/rules")).IntelligentGrainRules,
  },
  {
    name: "intelligent-grain-alerts",
    path: "/alerts",
    meta: { title: "告警中心" },
    component: async () => (await import("@/views/alerts")).IntelligentGrainAlerts,
  },
  {
    name: "intelligent-grain-alert-detail",
    path: "/alerts/:id",
    meta: { title: "告警详情" },
    component: async () => (await import("@/views/alerts/detail")).IntelligentGrainAlertDetail,
  },
  {
    name: "intelligent-grain-alert-disposal",
    path: "/alerts/:id/disposal",
    meta: { title: "处置详情" },
    component: async () => (await import("@/views/alerts/disposal")).IntelligentGrainAlertDisposal,
  },
  {
    name: "intelligent-grain-alert-acceptance",
    path: "/alerts/:id/acceptance",
    meta: { title: "验收详情" },
    component: async () => (await import("@/views/alerts/acceptance")).IntelligentGrainAlertAcceptance,
  },
];
