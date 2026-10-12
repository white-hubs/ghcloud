import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/electrical-center",
  },
  {
    name: "electrical-safety-center",
    path: "/electrical-center",
    meta: { title: "电气中心" },
    component: async () => (await import("@/views/electrical-center/electrical-center")).ElectricalCenter,
  },
  {
    name: "electrical-safety-device-monitoring",
    path: "/device-monitoring",
    meta: { title: "设备检测" },
    component: async () => (await import("@/views/device-monitoring/device-monitoring")).DeviceMonitoring,
  },
  {
    name: "electrical-safety-deep-analysis",
    path: "/deep-analysis",
    meta: { title: "设备深度分析" },
    component: async () => (await import("@/views/deep-analysis/deep-analysis")).DeepAnalysis,
  },
  {
    name: "electrical-safety-facility-management",
    path: "/facility-management",
    meta: { title: "设施管理" },
    component: async () => (await import("@/views/facility-management/facility-management")).FacilityManagement,
  },
  {
    name: "electrical-safety-remote-inspection-config",
    path: "/remote-inspection-config",
    meta: { title: "远检配置" },
    component: async () => (await import("@/views/remote-inspection-config/remote-inspection-config")).RemoteInspectionConfig,
  },
  {
    name: "electrical-safety-remote-inspection-view",
    path: "/remote-inspection-view",
    meta: { title: "远检查看" },
    component: async () => (await import("@/views/remote-inspection-view/remote-inspection-view")).RemoteInspectionView,
  },
];
