import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/personnel" },
  {
    name: "home",
    path: "/home",
    meta: { title: "首页" },
    component: async () => (await import("@/views/home")).HomePage,
  },
  {
    name: "personnel",
    path: "/personnel",
    meta: { title: "人员管理" },
    component: async () => (await import("@/views/personnel")).PersonnelPage,
  },
  {
    name: "committee",
    path: "/committee",
    meta: { title: "安委会管理" },
    component: async () => (await import("@/views/committee")).CommitteePage,
  },
  {
    name: "certificates",
    path: "/certificates",
    meta: { title: "证书管理" },
    component: async () => (await import("@/views/certificates")).CertificatesPage,
  },
  {
    name: "configCert",
    path: "/config/cert",
    meta: { title: "证书配置" },
    component: async () => (await import("@/views/config/cert")).CertConfigPage,
  },
  {
    name: "configOrg",
    path: "/config/org",
    meta: { title: "组织管理配置" },
    component: async () => (await import("@/views/config/org")).OrgConfigPage,
  },
  {
    name: "keyPersonnel",
    path: "/key-personnel",
    meta: { title: "重点人员信息管理" },
    component: async () => (await import("@/views/key-personnel/personnel")).KeyPersonnelPage,
  },
  {
    name: "keyPersonnelTrack",
    path: "/key-personnel/track",
    meta: { title: "行为轨迹查询" },
    component: async () => (await import("@/views/key-personnel/track")).KeyPersonnelTrackPage,
  },
  {
    name: "keyPersonnelStatistics",
    path: "/key-personnel/statistics",
    meta: { title: "统计分析看板" },
    component: async () => (await import("@/views/key-personnel/statistics")).KeyPersonnelStatisticsPage,
  },
];
