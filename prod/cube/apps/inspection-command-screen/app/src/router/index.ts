import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: async () => (await import("@/views/login")).LoginView,
  },
  {
    path: "/",
    name: "dashboard",
    component: async () => (await import("@/views/dashboard")).DashboardView,
  },
];
