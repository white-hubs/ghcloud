import type { RouteRecordRaw } from "vue-router";

const routers: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    meta: { title: "应急指挥" },
    component: async () => (await import("@/pages/entry/entry")).Entry,
  },
  {
    name: "entry",
    path: "/entry",
    meta: { title: "应急指挥" },
    component: async () => (await import("@/pages/entry/entry")).Entry,
  },
  {
    name: "alarm-records",
    path: "/alarm-records",
    meta: { title: "报警记录" },
    component: async () => (await import("@/pages/alarm-records/alarm-records")).AlarmRecords,
  },
  {
    name: "evacuation-guide",
    path: "/evacuation-guide",
    meta: { title: "疏散指引" },
    component: async () => (await import("@/pages/evacuation-guide/evacuation-guide")).EvacuationGuide,
  },
];

export const routes: RouteRecordRaw[] = [...routers];
