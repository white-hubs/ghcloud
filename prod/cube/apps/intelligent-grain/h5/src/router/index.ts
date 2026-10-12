import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/grain",
  },
  {
    path: "/entry",
    redirect: "/grain",
  },
  {
    name: "grain",
    path: "/grain",
    meta: {
      title: "智能粮情",
    },
    component: async () => (await import("@/views/entry")).IntelligentGrainH5Entry,
  },
  {
    name: "alerts",
    path: "/alerts",
    meta: {
      title: "粮情告警",
    },
    component: async () => (await import("@/views/entry")).IntelligentGrainH5Entry,
  },
];
