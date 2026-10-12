import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/evacuation-route-config" },
  {
    name: "resource-list",
    path: "/resource-list",
    meta: { title: "资源清单" },
    component: async () => (await import("@/views/resource-list")).ResourceList,
  },
  {
    name: "evacuation-route-config",
    path: "/evacuation-route-config",
    meta: { title: "疏散引导配置" },
    component: async () => (await import("@/views/evacuation-route-config")).EvacuationRouteConfig,
  },
  {
    name: "evacuation-command",
    path: "/evacuation-command",
    meta: { title: "疏散指挥" },
    component: async () => (await import("@/views/evacuation-command")).EvacuationCommand,
  },
];
