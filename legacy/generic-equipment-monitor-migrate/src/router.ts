import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/overView",
    component: () => import("@/views/pages/overView.vue"),
    name: "总览中心",
    meta: {
      title: "总览中心",
      keepAlive: true,
    },
  },
  {
    path: "/equipmentMoitorList",
    component: () => import("@/views/pages/equipmentMoitor/equipmentMoitorList.vue"),
    name: "设备监测",
    meta: {
      title: "设备监测",
      keepAlive: true,
    },
  },
  {
    path: "/equipmentMoitorDetail",
    component: () => import("@/views/pages/equipmentMoitor/equipmentMoitorDetail.vue"),
    name: "监测详情",
    meta: {
      title: "监测详情",
      keepAlive: true,
    },
  },
  {
    path: "/alarmRecord",
    component: () => import("@/views/pages/alarmRecord/alarmPage.vue"),
    name: "报警记录",
    meta: {
      title: "报警记录",
      keepAlive: true,
    },
  },
  {
    path: "/alarmDetail",
    component: () => import("@/views/pages/alarmRecord/detail.vue"),
    name: "报警详情",
    meta: {
      title: "报警详情",
      keepAlive: true,
    },
  },
  {
    path: "/alarmRecordSafety",
    component: () => import("@/views/pages/alarmRecordSafety/alarmPage.vue"),
    name: "安全报警记录",
    meta: {
      title: "安全报警记录",
      keepAlive: true,
    },
  },
  {
    path: "/alarmSafetyDetail",
    component: () => import("@/views/pages/alarmRecordSafety/detail.vue"),
    name: "安全报警详情",
    meta: {
      title: "安全报警详情",
      keepAlive: true,
    },
  },
  {
    path: "/alarmConfigList",
    component: () => import("@/views/pages/alarmConfig/configList.vue"),
    name: "报警配置",
    meta: {
      title: "报警配置",
      keepAlive: true,
    },
  },
  {
    path: "/alarmConfigEnergyList",
    component: () => import("@/views/pages/alarmConfigEngergy/configList.vue"),
    name: "报警配置1",
    meta: {
      title: "报警配置1",
      keepAlive: true,
    },
  },
  {
    path: "/alarmConfigureAdd",
    component: () => import("@/views/pages/alarmConfigEngergy/configDetail.vue"),
    name: "报警配置详情1",
    meta: {
      title: "报警配置详情1",
      keepAlive: true,
    },
  },
  {
    path: "/alarmStatistic",
    component: () => import("@/views/pages/statisticalAnalysis/alarmStatistic.vue"),
    name: "报警统计",
    meta: {
      title: "报警统计",
      keepAlive: true,
    },
  },
  {
    path: "/alarm/record",
    name: "下钻报警记录",
    component: () => import("@/views/pages/statisticalAnalysis/alarmRecord.vue"),
    meta: {
      title: "下钻报警记录",
      keepAlive: true,
    },
  },
  {
    path: "/alarmHandelStatistics",
    component: () => import("@/views/pages/statisticalAnalysis/alarmHandelStatistics.vue"),
    name: "报警处理统计",
    meta: {
      title: "报警处理统计",
      keepAlive: true,
    },
  },
  {
    path: "/alarmAnalysis",
    component: () => import("@/views/pages/statisticalAnalysis/alarmAnalysis.vue"),
    name: "报警分析",
    meta: {
      title: "报警分析",
      keepAlive: true,
    },
  },
  {
    path: "/applicationEquipment",
    component: () => import("@/views/pages/statisticalAnalysis/applicationEquipment.vue"),
    name: "报警设备",
    meta: {
      title: "报警设备",
      keepAlive: true,
    },
  },
  {
    path: "/configuration",
    component: () => import("@/views/pages/equipmentMoitor/configuration.vue"),
    name: "configuration",
    meta: {
      title: "二维组态图",
      keepAlive: true,
    },
  },
];
