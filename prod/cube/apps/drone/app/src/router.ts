import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/overview",
  },
  {
    path: "/overview",
    alias: ["/inspection-overview"],
    name: "DroneInspectionOverview",
    meta: {
      title: "巡检总览",
    },
    component: async () => (await import("@/views/drone-inspection/overview/overview")).DroneInspectionOverview,
  },
  {
    path: "/monitor",
    alias: ["/realtime-monitor"],
    name: "DroneInspectionMonitor",
    meta: {
      title: "实时监控",
    },
    component: async () => (await import("@/views/drone-inspection/monitor/monitor")).DroneInspectionMonitor,
  },
  {
    path: "/alerts",
    alias: ["/alert-disposal"],
    name: "DroneInspectionAlerts",
    meta: {
      title: "告警与处置",
    },
    component: async () => (await import("@/views/drone-inspection/alerts/alerts")).DroneInspectionAlerts,
  },
  {
    path: "/inspection-objects",
    alias: ["/inspection-object", "/inspection-object-ledger"],
    name: "DroneInspectionObjects",
    meta: {
      title: "巡检对象台账",
    },
    component: async () => (await import("@/views/drone-inspection/objects/objects")).DroneInspectionObjects,
  },
  {
    path: "/inspection-routes",
    alias: ["/inspection-route"],
    name: "DroneInspectionRoutes",
    meta: {
      title: "巡检航线",
    },
    component: async () => (await import("@/views/drone-inspection/routes/routes")).DroneInspectionRoutes,
  },
  {
    path: "/inspection-route-create",
    name: "DroneInspectionRouteCreate",
    meta: {
      title: "新增航线",
    },
    component: async () => (await import("@/views/drone-inspection/routes/route-editor")).DroneInspectionRouteCreate,
  },
  {
    path: "/inspection-route-edit",
    name: "DroneInspectionRouteEdit",
    meta: {
      title: "编辑航线",
    },
    component: async () => (await import("@/views/drone-inspection/routes/route-editor")).DroneInspectionRouteEdit,
  },
  {
    path: "/inspection-route-preview",
    name: "DroneInspectionRoutePreview",
    meta: {
      title: "航线预览",
    },
    component: async () => (await import("@/views/drone-inspection/routes/route-editor")).DroneInspectionRoutePreview,
  },
  {
    path: "/inspection-plans",
    alias: ["/inspection-plan"],
    name: "DroneInspectionPlans",
    meta: {
      title: "巡检计划",
    },
    component: async () => (await import("@/views/drone-inspection/plans/plans")).DroneInspectionPlans,
  },
  {
    path: "/ai-recognition",
    alias: ["/ai-recognition-center"],
    name: "DroneAiRecognition",
    meta: {
      title: "AI识别中心",
    },
    component: async () => (await import("@/views/drone-inspection/ai-recognition/ai-recognition")).DroneAiRecognition,
  },
  {
    path: "/inspection-reports",
    alias: ["/inspection-report"],
    name: "DroneInspectionReports",
    meta: {
      title: "巡检报告",
    },
    component: async () => (await import("@/views/drone-inspection/reports/reports")).DroneInspectionReports,
  },
  {
    path: "/alarm-dispatch-config",
    name: "AlarmDispatchConfig",
    meta: {
      title: "报警派飞配置",
    },
    component: async () => (await import("@/views/alarm-dispatch/config")).AlarmDispatchConfig,
  },
  {
    path: "/alarm-dispatch-records",
    name: "AlarmDispatchRecords",
    meta: {
      title: "报警派飞日志",
    },
    component: async () => (await import("@/views/alarm-dispatch/records")).AlarmDispatchRecords,
  },
  {
    path: "/alarm-dispatch-record-detail",
    name: "AlarmDispatchRecordDetail",
    meta: {
      title: "报警派飞日志详情",
    },
    component: async () => (await import("@/views/alarm-dispatch/record-detail")).AlarmDispatchRecordDetail,
  },
  {
    path: "/drone-route",
    name: "DroneHome",
    meta: {
      title: "航线列表",
    },
    component: async () => (await import("@/views/track-list/track-list")).TrackList,
  },
  {
    path: "/flight-task-list",
    name: "FlightTaskList",
    meta: {
      title: "飞行任务列表",
    },
    component: async () => (await import("@/views/flight-task-list/flight-task-list")).FlightTaskList,
  },
  {
    path: "/track-detail",
    name: "TrackDetail",
    meta: {
      title: "航线详情",
    },
    component: async () => (await import("@/views/track-detail/track-detail")).TrackDetail,
  },
  {
    path: "/flight-task-detail",
    name: "FlightTaskDetail",
    meta: {
      title: "飞行任务详情",
    },
    component: async () => (await import("@/views/flight-task-detail/flight-task-detail")).FlightTaskDetail,
  },
  {
    path: "/task-achievement-list",
    name: "TaskAchievementList",
    meta: {
      title: "任务成果列表",
    },
    component: async () => (await import("@/views/task-achievement-list/task-achievement-list")).TaskAchievementList,
  },
  {
    path: "/task-achievement-detail",
    name: "TaskAchievementDetail",
    meta: {
      title: "任务成果详情",
    },
    component: async () => (await import("@/views/task-achievement-detail/task-achievement-detail")).TaskAchievementDetail,
  },
];
