import type { RouteRecordRaw } from "vue-router";

const routers: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/entry",
  },
  {
    name: "entry",
    path: "/entry",
    meta: {
      title: "安全人员管理",
    },
    component: async () => (await import("@/views/entry/entry")).Entry,
  },
  {
    name: "personnel",
    path: "/personnel",
    meta: {
      title: "安全人员",
      description: "人员关联、履历与证书",
      isFilter: true,
    },
    component: async () => (await import("@/views/personnel/personnel-list")).PersonnelListPage,
  },
  {
    name: "personnelDetail",
    path: "/personnel/detail",
    meta: {
      title: "安全人员详情",
    },
    component: async () => (await import("@/views/personnel/personnel-detail")).PersonnelDetailPage,
  },
  {
    name: "keyPersonnel",
    path: "/key-personnel",
    meta: {
      title: "重点人员",
      description: "监管台账、上报与档案",
      isFilter: true,
    },
    component: async () => (await import("@/views/key-personnel/key-personnel-list")).KeyPersonnelListPage,
  },
  {
    name: "keyPersonnelDetail",
    path: "/key-personnel/detail",
    meta: {
      title: "重点人员详情",
    },
    component: async () => (await import("@/views/key-personnel/key-personnel-detail")).KeyPersonnelDetailPage,
  },
  {
    name: "keyPersonnelForm",
    path: "/key-personnel/form",
    meta: {
      title: "重点人员编辑",
    },
    component: async () => (await import("@/views/key-personnel/key-personnel-form")).KeyPersonnelFormPage,
  },
  {
    name: "keyPersonnelReport",
    path: "/key-personnel/report",
    meta: {
      title: "监管上报",
    },
    component: async () => (await import("@/views/key-personnel/key-personnel-report")).KeyPersonnelReportPage,
  },
];

export const routes: RouteRecordRaw[] = [...routers];
