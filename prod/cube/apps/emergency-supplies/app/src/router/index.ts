import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    name: "emergency-supplies-redirect",
    path: "/",
    redirect: "/supplies-list",
  },
  {
    name: "warehouse-list",
    path: "/warehouse-list",
    meta: { title: "仓库管理" },
    component: async () => (await import("@/views/warehouse-list/warehouse-list")).WarehouseList,
  },
  {
    name: "supplies-type-list",
    path: "/supplies-type-list",
    meta: { title: "物资类别" },
    component: async () => (await import("@/views/supplies-type-list/supplies-type-list")).SuppliesTypeList,
  },
  {
    name: "supplies-list",
    path: "/supplies-list",
    meta: { title: "物资台账" },
    component: async () => (await import("@/views/supplies-list/supplies-list")).SuppliesList,
  },
  {
    name: "dispatch-order-list",
    path: "/dispatch-order-list",
    meta: { title: "物资调用" },
    component: async () => (await import("@/views/dispatch-order-list/dispatch-order-list")).DispatchOrderList,
  },
  {
    name: "warning-config",
    path: "/warning-config",
    meta: { title: "预警规则配置" },
    component: async () => (await import("@/views/warning-config/warning-config")).WarningConfig,
  },
  {
    name: "supplies-map",
    path: "/supplies-map",
    meta: { title: "物资一张图" },
    component: async () => (await import("@/views/supplies-map/supplies-map")).SuppliesMap,
  },
];
