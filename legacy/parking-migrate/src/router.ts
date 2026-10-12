import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/parkingMonitoring",
    component: () => import("@/views/pages/parkingMonitoring.vue"),
    name: "停车统计",
    meta: {
      title: "停车统计",
      keepAlive: true,
    },
  },
  {
    path: "/parkingVehicleFlowStatistics",
    component: () => import("@/views/pages/parkingVehicleFlowStatistics.vue"),
    name: "停车场车辆统计",
    meta: {
      title: "停车场车辆统计",
      keepAlive: true,
    },
  },
  {
    path: "/parkingVehicleFlowDetail",
    component: () => import("@/views/pages/parkingVehicleFlowDetail.vue"),
    name: "车辆统计明细",
    meta: {
      title: "车辆统计明细",
      keepAlive: true,
    },
  },
  {
    path: "/accessRecords",
    component: () => import("@/views/pages/accessRecords.vue"),
    name: "出入记录",
    meta: {
      title: "出入记录",
      keepAlive: true,
    },
  },
  {
    path: "/strandedVehicles",
    component: () => import("@/views/pages/strandedVehicles.vue"),
    name: "滞留车辆",
    meta: {
      title: "滞留车辆",
      keepAlive: true,
    },
  },
  {
    path: "/charges",
    component: () => import("@/views/pages/charges.vue"),
    name: "收费记录",
    meta: {
      title: "收费记录",
      keepAlive: true,
    },
  },
  {
    path: "/car-approve-add",
    component: () => import("@/views/pages/car-approve/add.vue"),
    name: "新增车辆审批",
    meta: {
      title: "新增车辆审批",
      keepAlive: true,
    },
  },
  {
    path: "/car-approve-change",
    component: () => import("@/views/pages/car-approve/change.vue"),
    name: "变更车辆审批",
    meta: {
      title: "变更车辆审批",
      keepAlive: true,
    },
  },
  {
    path: "/car-approve-delete",
    component: () => import("@/views/pages/car-approve/delete.vue"),
    name: "删除车辆审批",
    meta: {
      title: "删除车辆审批",
      keepAlive: true,
    },
  },
  {
    path: "/multipleVideo",
    component: () => import("@/views/pages/safetyManagement/multipleVideo.vue"),
    name: "车场监控",
    meta: {
      title: "车场监控",
      keepAlive: true,
    },
  },
  {
    path: "/trafficMultipleVideo",
    component: () => import("@/views/pages/safetyManagement/multipleVideo.vue"),
    name: "人流量监控",
    meta: {
      title: "人流量监控",
      keepAlive: true,
      isTraffic: true,
    },
  },
  {
    path: "/parkingManagement",
    component: () => import("@/views/pages/parkingManagement/parkingManagement.vue"),
    name: "车场管理",
    meta: {
      title: "车场管理",
      keepAlive: true,
    },
  },
  {
    path: "/parkingCreate",
    component: () => import("@/views/pages/parkingManagement/parkingCreate.vue"),
    name: "车场新增",
    meta: {
      title: "车场新增",
      keepAlive: true,
    },
  },
  {
    path: "/parkingDetail",
    component: () => import("@/views/pages/parkingManagement/parkingDetail.vue"),
    name: "车场详情",
    meta: {
      title: "车场详情",
      keepAlive: true,
    },
  },
  {
    path: "/trafficArea",
    component: () => import("@/views/pages/trafficArea/trafficArea.vue"),
    name: "",
    meta: {
      title: "人流区域",
      keepAlive: true,
    },
  },
  {
    path: "/trafficAreaCreate",
    component: () => import("@/views/pages/trafficArea/trafficAreaCreate.vue"),
    name: "人流新增",
    meta: {
      title: "车场新增",
      keepAlive: true,
    },
  },
  {
    path: "/trafficAreaDetail",
    component: () => import("@/views/pages/trafficArea/trafficAreaDetail.vue"),
    name: "人流详情",
    meta: {
      title: "车场详情",
      keepAlive: true,
    },
  },
  {
    path: "/trafficAreaStatistics",
    component: () => import("@/views/pages/trafficArea/trafficAreaStatistics.vue"),
    name: "区域人流统计",
    meta: {
      title: "区域人流统计",
      keepAlive: true,
    },
  },
  {
    path: "/trafficAreaPersonFlowStatistics",
    component: () => import("@/views/pages/trafficArea/trafficAreaPersonFlowStatistics.vue"),
    name: "区域人流统计看板",
    meta: {
      title: "区域人流统计看板",
      keepAlive: true,
    },
  },
  {
    path: "/trafficAreaPersonFlowDetail",
    component: () => import("@/views/pages/trafficArea/trafficAreaPersonFlowDetail.vue"),
    name: "客流详情",
    meta: {
      title: "客流详情",
      keepAlive: true,
    },
  },
  {
    path: "/thirdParty",
    component: () => import("@/views/pages/thirdParty/thirdParty.vue"),
    name: "三方数据",
    meta: {
      title: "三方数据",
      keepAlive: true,
    },
  },
  {
    path: "/black-list",
    component: async () => (await import("@/views/pages/black/black-list/black-list")).BlackList,
    name: "违停黑名单",
    meta: {
      title: "违停黑名单",
      keepAlive: true,
    },
  },
  {
    path: "/black-list-detail",
    component: async () => (await import("@/views/pages/black/black-list-detail/black-list-detail")).BlackListDetail,
    name: "违停黑名单明细",
    meta: {
      title: "违停黑名单明细",
      keepAlive: true,
    },
  },
  {
    path: "/black-rule",
    component: async () => (await import("@/views/pages/black/black-rule/black-rule")).BlackRule,
    name: "黑名单规则",
    meta: {
      title: "黑名单规则",
      keepAlive: true,
    },
  },
  {
    path: "/car-management-list",
    component: async () => (await import("@/views/pages/car-management/car-management-list/car-management-list")).CarManagementList,
    name: "车辆管理",
    meta: {
      title: "车辆管理",
      keepAlive: true,
    },
  },
  {
    path: "/car-management-edit",
    component: async () => (await import("@/views/pages/car-management/car-management-edit/car-management-edit")).CarManagementEdit,
    name: "车辆编辑",
    meta: {
      title: "车辆编辑",
      keepAlive: true,
    },
  },
  {
    path: "/car-type",
    component: async () => (await import("@/views/pages/car-management/car-type/car-type")).CarType,
    name: "车辆类型",
    meta: {
      title: "车辆类型",
      keepAlive: true,
    },
  },
  {
    path: "/illegal-parking-list",
    component: async () => (await import("@/views/pages/illegal-parking/illegal-parking-list/illegal-parking-list")).IllegalParkingList,
    name: "车辆违停列表",
    meta: {
      title: "车辆违停列表",
      keepAlive: true,
    },
  },
  {
    path: "/illegal-parking-config",
    component: async () =>
      (await import("@/views/pages/illegal-parking/illegal-parking-config/illegal-parking-config")).IllegalParkingConfig,
    name: "违停配置",
    meta: {
      title: "违停配置",
      keepAlive: true,
    },
  },
  {
    path: "/guide-sign",
    component: async () => (await import("@/views/pages/guide-sign/guide-sign-list/guide-sign-list")).GuideSignList,
    name: "引导牌列表",
    meta: {
      title: "引导牌列表",
      keepAlive: true,
    },
  },
  {
    path: "/guide-sign-config",
    component: async () => (await import("@/views/pages/guide-sign-edit/guide-sign-edit")).GuideSignEdit,
    name: "引导牌配置",
    meta: {
      title: "引导牌配置",
      keepAlive: true,
    },
  },

  // {
  //   path: '/guideSign',
  //   component: () => import("@/views/pages/guideBoard/guideBoardManagement.vue"),
  //   name: "引导牌管理",
  //   meta: {
  //     title: "引导牌管理",
  //     keepAlive: true,
  //   },
  // },
  //   {
  //   path: '/guideBoardEdit',
  //   component: () => import("@/views/pages/guideBoard/guideBoardEdit.vue"),
  //   name: "引导牌新增",
  //   meta: {
  //     title: "引导牌新增",
  //     keepAlive: true,
  //   },
  // },
];
