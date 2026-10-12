import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    name: "work-permit-h5-home",
    path: "/",
    meta: { title: "危险作业" },
    component: async () => (await import("@/views/home/home")).Home,
  },
];
