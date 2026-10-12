import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "province-dashboard",
    meta: { title: "集团储量安全驾驶舱" },
    component: async () => (await import("@/views/province-dashboard/province-dashboard")).ProvinceDashboard,
  },
  {
    path: "/details",
    name: "details",
    meta: { title: "库区在库保管驾驶舱" },
    component: async () => (await import("@/views/details-dashboard/details-dashboard")).DetailsDashboard,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];
