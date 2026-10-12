import type { RouteRecordRaw } from "vue-router";
export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/entry",
  },
  {
    name: "home",
    path: "/entry",
    meta: { title: "应急物资" },
    component: async () => (await import("@/views/home/home")).Home,
  },
  {
    name: "supplies-list",
    path: "/supplies-list",
    meta: { title: "物资台账" },
    component: async () => (await import("@/views/supplies-list/supplies-list")).SuppliesList,
  },
  {
    name: "supplies-form",
    path: "/supplies-form",
    meta: { title: "新增物资" },
    component: async () => (await import("@/views/supplies-form/supplies-form")).SuppliesForm,
  },
  {
    name: "supplies-detail",
    path: "/supplies-detail/:id",
    meta: { title: "物资详情" },
    component: async () => (await import("@/views/supplies-detail/supplies-detail")).SuppliesDetail,
  },
  {
    name: "dispatch-list",
    path: "/dispatch-list",
    meta: { title: "物资调用" },
    component: async () => (await import("@/views/dispatch-list/dispatch-list")).DispatchList,
  },
  {
    name: "dispatch-detail",
    path: "/dispatch-detail/:id",
    meta: { title: "调用详情" },
    component: async () => (await import("@/views/dispatch-detail/dispatch-detail")).DispatchDetail,
  },
];
