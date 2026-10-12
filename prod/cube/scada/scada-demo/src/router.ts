import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/scada-demo",
    name: "scada-demo",
    component: async () => (await import("@/views/scada-demo/scada-demo")).ScadaDemoView,
  },
  {
    path: "/",
    redirect: "/scada-demo",
  },
];
