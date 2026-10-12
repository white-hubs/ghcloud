import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
      path: "/alarmPage",
      name: '报警记录',
      component: () => import("@/views/alarmRecord/alarmPage.vue"),
      meta: {
        title: "报警记录",
        keepAlive: true
      }
  },
  {
      path: "/alarmDetail",
      name: '报警详情',
      component: () => import("@/views/alarmRecord/detail.vue"),
      meta: {
        title: "报警详情",
        keepAlive: true
      }
  },
  {
      path: "/multipleVideo",
      name: '多路视频',
      component: () => import("@/views/safetyManagement/multipleVideo.vue"),
      meta: {
        title: "多路视频",
        keepAlive: true
      }
  },
  {
    path: "/patrolLine",
    name: '巡逻线路',
    component: () => import("@/views/safetyManagement/patrolLine.vue"),
    meta: {
      title: "巡逻线路",
      keepAlive: true
    }
  },
  {
    path: "/addLine",
    name: '新增巡逻路线',
    component: () => import("@/views/safetyManagement/addLine.vue"),
    meta: {
      title: "新增巡逻路线",
      keepAlive: true
    }
  },
  {
    path: "/patrolLineDetail",
    name: '巡逻路线详情',
    component: () => import("@/views/safetyManagement/patrolLineDetail.vue"),
    meta: {
      title: "巡逻路线详情",
      keepAlive: true
    }
  },
  {
    path: "/patrolRecord",
    name: '巡逻记录',
    component: () => import("@/views/safetyManagement/patrolRecord.vue"),
    meta: {
      title: "巡逻记录",
      keepAlive: true
    }
  },
  {
    path: "/recordDetail",
    name: '巡逻记录详情',
    component: () => import("@/views/safetyManagement/recordDetail.vue"),
    meta: {
      title: "巡逻记录详情",
      keepAlive: true
    }
  },
  {
    path: "/implementPatro",
    name: '视频巡逻',
    component: () => import("@/views/safetyManagement/implementPatro.vue"),
    meta: {
      title: "视频巡逻",
      keepAlive: true
    }
  },
  {
    path: "/overView",
    name: "数据总览",
    component: () => import("@/views/overView.vue"),
    meta: {
      title: "数据总览",
      keepAlive: true,
    },
  },
  {
    path: "/monitoring",
    name: "监控权限",
    component: () => import("@/views/monitoring.vue"),
    meta: {
      title: "监控权限",
      keepAlive: true,
    },
  },
    {
    path: "/monitoringNew",
    name: "监控权限",
    component: () => import("@/views/monitoringNew.vue"),
    meta: {
      title: "监控权限",
      keepAlive: true,
    },
  },
  {
    path: "/alarmStatistics",
    name: "报警统计",
    component: () => import("@/views/statisticalAnalysis/alarmStatistics.vue"),
    meta: {
      title: "报警统计",
      keepAlive: true,
    },
  },
  {
    path: "/alarmHandelStatistics",
    name: "报警处理统计",
    component: () =>
      import("@/views/statisticalAnalysis/alarmHandelStatistics.vue"),
    meta: {
      title: "报警处理统计",
      keepAlive: true,
    },
  },
  {
    path: "/alarm/record",
    name: "下钻报警记录",
    component: () => import("@/views/statisticalAnalysis/alarmRecord.vue"),
    meta: {
      title: "下钻报警记录",
      keepAlive: true,
    },
  },
  {
    path: "/patrolStatistics",
    name: "巡逻统计",
    component: () => import("@/views/statisticalAnalysis/patrolStatistics.vue"),
    meta: {
      title: "巡逻统计",
      keepAlive: true,
    },
  },
  {
    path: "/patrol/record",
    name: "巡逻线路记录",
    component: () =>
      import("@/views/statisticalAnalysis/patrolRouteRecord.vue"),
    meta: {
      title: "巡逻线路记录",
      keepAlive: true,
    },
  },
  {
    path: "/safetyAnalysis",
    name: "安全分析",
    component: () => import("@/views/statisticalAnalysis/safetyAnalysis.vue"),
    meta: {
      title: "安全分析",
      keepAlive: true,
    },
  },
  {
    path: "/alarmRulesList",
    name: "报警配置",
    component: () => import("@/views/alarmRules/list.vue"),
    meta: {
      title: "报警配置",
      keepAlive: true,
    },
  },
  {
    path: "/alarmRulesConfig",
    name: "alarmRulesConfig",
    component: () => import("@/views/alarmRules/detail.vue"),
    meta: {
      title: "报警规则配置",
      keepAlive: true,
    },
  },
  {
    path: "/applicationEquipment",
    name: "applicationEquipment",
    component: () =>
      import("@/views/safetyManagement/applicationEquipment.vue"),
    meta: {
      title: "监控设备",
      keepAlive: true,
    },
  },
]