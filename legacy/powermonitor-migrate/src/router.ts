import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
    {
      path: "/electricManageHome",
      component: () => import("@/views/pages/electricManageHome.vue"),
      name: "电气中心",
      meta: {
        title: "电气中心",
        keepAlive: true,
      },
    },
    {
      path: "/electricMonitor",
      component: () => import("@/views/pages/electricMonitor.vue"),
      name: "电气监测",
      meta: {
        title: "电气监测",
        keepAlive: true,
      },
    },
    {
      path: "/electricMonitorDeil",
      component: () => import("@/views/pages/electricMonitorDeil.vue"),
      name: "设备详情",
      meta: {
        title: "设备详情",
        keepAlive: true,
      },
    },
    {
      path: "/electricCall",
      component: () => import("@/views/pages/alarmRecord/alarmPage.vue"),
      name: "电气报警",
      meta: {
        title: "电气报警",
        keepAlive: true,
      },
    },
    {
      path: "/electricCall",
      component: () => import("@/views/pages/alarmRecord/alarmPage.vue"),
      name: "电气报警",
      meta: {
        title: "电气报警",
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
      path: "/electricCallTj",
      component: () => import("@/views/pages/electricCallTj.vue"),
      name: "电气报警统计",
      meta: {
        title: "电气报警统计",
        keepAlive: true,
      },
    },
    {
      path: "/alarm/record",
      name: "下钻报警记录",
      component: () => import("@/views/pages/components/alarmRecord.vue"),
      meta: {
        title: "下钻报警记录",
        keepAlive: true,
      },
    },
    {
      path: "/electricDisposeTj",
      component: () => import("@/views/pages/electricDisposeTj.vue"),
      name: "报警处理统计",
      meta: {
        title: "报警处理统计",
        keepAlive: true,
      },
    },
    {
      path: "/electricDeviceMap",
      component: () => import("@/views/pages/electricDeviceMap.vue"),
      name: "gis地图",
      meta: {
        title: "gis地图",
        keepAlive: true,
      },
    },
    {
      path: "/electricElectricityTj",
      component: () => import("@/views/pages/electricElectricityTj.vue"),
      name: "园区用电统计",
      meta: {
        title: "园区用电统计",
        keepAlive: true,
      },
    },
    {
      path: "/electricDistributionTj",
      component: () => import("@/views/pages/electricDistributionTj.vue"),
      name: "园区配电统计",
      meta: {
        title: "园区配电统计",
        keepAlive: true,
      },
    },
    {
      path: "/electricAnalstTj",
      component: () => import("@/views/pages/electricAnalstTj.vue"),
      name: "电气分析",
      meta: {
        title: "电气分析",
        keepAlive: true,
      },
    },
    {
      path: "/electricCallConfig",
      component: () => import("@/views/pages/electricCallConfig.vue"),
      name: "报警配置",
      meta: {
        title: "报警配置",
        keepAlive: true,
      },
    },
    {
      path: "/electricCollectConfig",
      component: () => import("@/views/pages/electricCollectConfig.vue"),
      name: "采集配置",
      meta: {
        title: "采集配置",
        keepAlive: true,
      },
    },
    {
      path: "/electricDevice",
      component: () => import("@/views/pages/electricDevice.vue"),
      name: "电气设备",
      meta: {
        title: "电气设备",
        keepAlive: true,
      },
    },
  ];
  