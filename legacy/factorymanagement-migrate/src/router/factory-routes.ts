import type { RouteRecordRaw } from 'vue-router'

export const factoryRoutes: RouteRecordRaw[] = [
  {
    path: "/factoryView",
    component: () => import('@/views/pages/factoryView.vue'),
    name: "园区总览",
    meta: {
      title: "园区总览",
      keepAlive: true,
    },
  },
  {
    path: "/enterpriseInformation",
    component: () =>
      import("@/views/pages/customerManagement/enterpriseInformation.vue"),
    name: "企业信息",
    meta: {
      title: "企业信息",
      keepAlive: true,
    },
  },
  {
    path: "/enterpriseInformationAdd",
    component: () =>
      import("@/views/pages/customerManagement/enterpriseInformationAdd.vue"),
    name: "企业信息-新增",
    meta: {
      title: "企业信息-新增",
      keepAlive: true,
    },
  },
  {
    path: "/enterpriseDirectory",
    component: () =>
      import("@/views/pages/customerManagement/enterpriseDirectory.vue"),
    name: "企业名录",
    meta: {
      title: "企业名录",
      keepAlive: true,
    },
  },
  {
    path: "/industryType",
    component: () =>
      import("@/views/pages/customerManagement/industryType.vue"),
    name: "行业类型",
    meta: {
      title: "行业类型",
      keepAlive: true,
    },
  },
  {
    path: "/roomInformation",
    component: () => import("@/views/pages/roomManagement/roomInformation.vue"),
    name: "房间信息",
    meta: {
      title: "房间信息",
      keepAlive: true,
    },
  },
  {
    path: "/roomInformationAdd",
    component: () =>
      import("@/views/pages/roomManagement/roomInformationAdd.vue"),
    name: "房间信息-新增",
    meta: {
      title: "房间信息-新增",
      keepAlive: true,
    },
  },
  {
    path: "/roomType",
    component: () => import("@/views/pages/roomManagement/roomType.vue"),
    name: "房间类型",
    meta: {
      title: "房间类型",
      keepAlive: true,
    },
  },
  {
    path: "/enterpriseVisit",
    component: () => import("@/views/pages/visitDemands/enterpriseVisit.vue"),
    name: "企业走访",
    meta: {
      title: "企业走访",
      keepAlive: true,
    },
  },
  {
    path: "/enterpriseVisitAdd",
    component: () =>
      import("@/views/pages/visitDemands/enterpriseVisitAdd.vue"),
    name: "企业走访-新增",
    meta: {
      title: "企业走访-新增",
      keepAlive: true,
    },
  },
  {
    path: "/enterpriseDemands",
    component: () => import("@/views/pages/visitDemands/enterpriseDemands.vue"),
    name: "企业诉求",
    meta: {
      title: "企业诉求",
      keepAlive: true,
    },
  },
  {
    path: "/enterpriseDemandsAdd",
    component: () =>
      import("@/views/pages/visitDemands/enterpriseDemandsAdd.vue"),
    name: "企业诉求-新增",
    meta: {
      title: "企业诉求-新增",
      keepAlive: true,
    },
  },
  {
    path: "/demandsType",
    component: () => import("@/views/pages/visitDemands/demandsType.vue"),
    name: "诉求类型",
    meta: {
      title: "诉求类型",
      keepAlive: true,
    },
  },
  {
    path: "/visitType",
    component: () => import("@/views/pages/visitDemands/visitType.vue"),
    name: "走访类型",
    meta: {
      title: "走访类型",
      keepAlive: true,
    },
  },
  {
    path: "/roomRental",
    component: () => import("@/views/pages/rentalManagement/roomRental.vue"),
    name: "房间租赁",
    meta: {
      title: "房间租赁",
      keepAlive: true,
    },
  },
  {
    path: "/roomRentalAdd",
    component: () => import("@/views/pages/rentalManagement/roomRentalAdd.vue"),
    name: "房间租赁-新增",
    meta: {
      title: "房间租赁-新增",
      keepAlive: true,
    },
  },
  {
    path: "/roomStatus",
    component: () => import("@/views/pages/rentalManagement/roomStatus.vue"),
    name: "房间状态",
    meta: {
      title: "房间状态",
      keepAlive: true,
    },
  },
];
