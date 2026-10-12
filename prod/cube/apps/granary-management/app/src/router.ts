import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/main-management",
  },
  {
    path: "/granary-center",
    name: "granary-center",
    component: async () => (await import("@/views/granary-center/granary-center")).GranaryCenter,
  },
  {
    path: "/inventory-turnover-ratio",
    name: "inventory-turnover-ratio",
    component: async () => (await import("@/views/inventory-turnover-ratio/inventory-turnover-ratio")).InventoryTurnoverRatio,
  },
  {
    path: "/gain-temperature",
    name: "gain-temperature",
    component: async () => (await import("@/views/intelligent-prediction/gain-temperature")).GainTemperature,
  },
  {
    path: "/gain-temperature-config",
    name: "gain-temperature-config",
    component: async () => (await import("@/views/intelligent-prediction/gain-temperature-config")).GainTemperatureConfig,
  },
  {
    path: "/grain-quality-change",
    name: "grain-quality-change",
    component: async () => (await import("@/views/grain-quality-change/grain-quality-change")).GrainQualityChange,
  },
  {
    path: "/pest-trend-prediction",
    name: "pest-trend-prediction",
    component: async () => (await import("@/views/pest-trend-prediction/pest-trend-prediction")).PestTrendPrediction,
  },
  {
    path: "/inventory-loss-prediction",
    name: "inventory-loss-prediction",
    component: async () => (await import("@/views/inventory-loss-prediction/inventory-loss-prediction")).InventoryLossPrediction,
  },
  {
    path: "/main-management",
    name: "main-management",
    component: async () => (await import("@/views/main-management/main-management")).MainManagement,
  },
  {
    path: "/main-management/associate-devices",
    name: "associate-devices",
    component: async () => (await import("@/views/associate-devices/associate-devices")).AssociateDevices,
  },
  {
    path: "/main-management/unbind",
    name: "granary-unbind-preview",
    component: async () => (await import("@/views/granary-unbind-preview/granary-unbind-preview")).GranaryUnbindPreview,
  },
  {
    path: "/main-management/warehouse-detail",
    name: "warehouse-detail-dashboard",
    meta: {
      isFullWindow: true,
    },
    component: async () => (await import("@/views/warehouse-detail-dashboard/warehouse-detail-dashboard")).WarehouseDetailDashboard,
  },
  {
    path: "/main-management/pallet-position-card",
    name: "pallet-position-card",
    meta: {
      isFullWindow: true,
    },
    component: async () => (await import("@/views/pallet-position-card/pallet-position-card")).PalletPositionCard,
  },
  {
    path: "/warehouse-location-card-config",
    name: "warehouse-location-card-config",
    component: async () =>
      (await import("@/views/warehouse-location-card-config/warehouse-location-card-config-list")).WarehouseLocationCardConfigList,
  },
  {
    path: "/warehouse-location-card-config/detail",
    name: "warehouse-location-card-config-detail",
    component: async () =>
      (await import("@/views/warehouse-location-card-config/warehouse-location-card-config-detail")).WarehouseLocationCardConfigDetail,
  },
  {
    path: "/warehouse-location-card-config/operation-records",
    name: "warehouse-location-card-config-operation-records",
    component: async () =>
      (await import("@/views/warehouse-location-card-config/warehouse-location-card-operation-records"))
        .WarehouseLocationCardOperationRecords,
  },
  {
    path: "/statistical-panel",
    name: "statistical-panel",
    meta: {
      isFullWindow: true,
    },
    component: async () => (await import("@/views/statistical-panel/statistical-panel")).StatisticalPanel,
  },
  {
    path: "/radar-monitoring",
    name: "radar-monitoring",
    component: async () => (await import("@/views/radar-monitoring/radar-monitoring")).RadarMonitoring,
  },
  {
    path: "/gas-monitoring",
    name: "gas-monitoring",
    component: async () => (await import("@/views/gas-monitoring/gas-monitoring")).GasMonitoring,
  },
  {
    path: "/temperature-humidity-monitoring",
    name: "temperature-humidity-monitoring",
    component: async () =>
      (await import("@/views/temperature-humidity-monitoring/temperature-humidity-monitoring")).TemperatureHumidityMonitoring,
  },
  {
    path: "/granary-platform-hub",
    name: "granary-platform-hub",
    meta: {
      isFullWindow: true,
    },
    component: async () => (await import("@/views/granary-platform-hub/granary-platform-hub")).GranaryPlatformHub,
  },
  {
    path: "/cable-management",
    name: "cable-management",
    component: async () => (await import("@/views/cable-management/cable-management")).CableManagement,
  },
  {
    path: "/warehouse-temperature-report",
    name: "warehouse-temperature-report",
    component: async () => (await import("@/views/warehouse-temperature-report/warehouse-temperature-report")).WarehouseTemperatureReport,
  },
  {
    path: "/storage-archive",
    name: "storage-archive",
    component: async () => (await import("@/views/storage-archive/storage-archive")).StorageArchive,
  },
  {
    path: "/gas-archive",
    name: "gas-archive",
    component: async () => (await import("@/views/gas-archive/gas-archive")).GasArchive,
  },
  {
    path: "/temperature-trend-alert",
    name: "temperature-trend-alert",
    component: async () => (await import("@/views/temperature-trend-alert/temperature-trend-alert-config")).TemperatureTrendAlertConfig,
  },
  {
    path: "/temperature-trend-alert/config",
    name: "temperature-trend-alert-config",
    component: async () => (await import("@/views/temperature-trend-alert/temperature-trend-alert-config")).TemperatureTrendAlertConfig,
  },
  {
    path: "/temperature-trend-alert/records",
    name: "temperature-trend-alert-records",
    component: async () => (await import("@/views/temperature-trend-alert/temperature-trend-alert-records")).TemperatureTrendAlertRecords,
  },
  {
    path: "/temperature-trend-alert/trend",
    name: "temperature-trend-alert-trend",
    component: async () => (await import("@/views/temperature-trend-alert/temperature-trend-alert-trend")).TemperatureTrendAlertTrend,
  },
];
