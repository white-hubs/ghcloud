import type { RouteRecordRaw } from "vue-router";

import type { AppRoutes } from "@ghcloud/cube-app-generic-component";
const routers: AppRoutes = [
  {
    redirect: "/entry",
    path: "/",
    name: "root",
  },
  {
    name: "entry",
    path: "/entry",
    component: async () => (await import("@/views/entry/entry")).Entry,
    meta: {
      title: "设备",
    },
  },
  {
    name: "baseMonitorDevice?applicationCode=ELECTRICMANAGE",
    path: "/baseMonitorDevice?applicationCode=ELECTRICMANAGE",
    redirect: "/baseMonitorDevice",
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        applicationCode: "ELECTRICMANAGE",
      };
    },
  },
  {
    name: "baseMonitorDevice?applicationCode=GAS_MANAGEMENT",
    path: "/baseMonitorDevice?applicationCode=GAS_MANAGEMENT",
    redirect: "/baseMonitorDevice",
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        applicationCode: "GAS_MANAGEMENT",
      };
    },
  },
  {
    name: "baseMonitorDevice?applicationCode=FIRECONTROL",
    path: "/baseMonitorDevice?applicationCode=FIRECONTROL",
    redirect: "/baseMonitorDevice",
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        applicationCode: "FIRECONTROL",
      };
    },
  },
  {
    name: "baseMonitorDevice?applicationCode=ROTATINGMANAGE",
    path: "/baseMonitorDevice?applicationCode=ROTATINGMANAGE",
    redirect: "/baseMonitorDevice",
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        applicationCode: "ROTATINGMANAGE",
      };
    },
  },
  {
    name: "baseMonitorDevice",
    path: "/baseMonitorDevice",
    meta: {
      title: "设备监测",
      barRightType: "filter",
    },
    component: async () => (await import("@/views/device-list/device-list")).DeviceList,
  },
  {
    name: "device-monitor",
    path: "/device-monitor",
    meta: {
      title: "设备监控",
    },
    component: async () => (await import("@/views/device-monitor/device-monitor")).DeviceMonitor,
  },
  {
    name: "/electricalSafetyAnalyse",
    path: "/electricalSafetyAnalyse",
    redirect: "/device-analysis",
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        applicationCode: "ELECTRICMANAGE",
      };
    },
  },
  {
    name: "fireSafetyAnalyse",
    path: "/fireSafetyAnalyse",
    redirect: "/device-analysis",
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        applicationCode: "FIRECONTROL",
      };
    },
  },
  {
    name: "/movingRingAnalyse",
    path: "/movingRingAnalyse",
    redirect: "/device-analysis",
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        applicationCode: "ROTATINGMANAGE",
      };
    },
  },
  {
    name: "device-analysis",
    path: "/device-analysis",
    meta: {
      title: "设备分析",
    },
    component: async () => (await import("@/views/device-analysis/device-analysis")).DeviceAnalysis,
  },
  {
    name: "history",
    path: "/history",
    meta: {
      title: "历史数据",
    },
    component: async () => (await import("@/views/history/history")).History,
  },
  {
    name: "monitor-detail",
    path: "/monitor-detail",
    meta: {
      title: "监测详情",
    },
    component: async () => (await import("@/views/monitor-detail/monitor-detail")).MonitorDetail,
  },
  {
    name: "monitor-scada",
    path: "/monitor-scada",
    meta: {
      title: "二维组态",
    },
    component: async () => (await import("@/views/monitor-detail/scada-page")).ScadaPage,
  },
  {
    name: "baseAlarmRecords?applicationCode=ELECTRICMANAGE",
    path: "/baseAlarmRecords?applicationCode=ELECTRICMANAGE",
    redirect: "/baseAlarmRecords",
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        applicationCode: "ELECTRICMANAGE",
      };
    },
  },
  {
    name: "baseAlarmRecords?applicationCode=GAS_MANAGEMENT",
    path: "/baseAlarmRecords?applicationCode=GAS_MANAGEMENT",
    redirect: "/baseAlarmRecords",
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        applicationCode: "GAS_MANAGEMENT",
      };
    },
  },
  {
    name: "baseAlarmRecords?applicationCode=FIRECONTROL",
    path: "/baseAlarmRecords?applicationCode=FIRECONTROL",
    redirect: "/baseAlarmRecords",
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        applicationCode: "FIRECONTROL",
      };
    },
  },
  {
    name: "baseAlarmRecords?applicationCode=ROTATINGMANAGE",
    path: "/baseAlarmRecords?applicationCode=ROTATINGMANAGE",
    redirect: "/baseAlarmRecords",
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        applicationCode: "ROTATINGMANAGE",
      };
    },
  },
  {
    name: "baseAlarmRecords",
    path: "/baseAlarmRecords",
    component: async () => (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-records")).AlarmRecords,
  },
  {
    name: "alarm-handle",
    path: "/alarm-handle",
    meta: {
      title: "报警处理",
    },
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        sourceApp: __ENV__.applicationCode,
      };
    },
    component: async () => (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-handle/alarm-handle")).AlarmHandle,
  },
  {
    name: "alarm-transfer",
    path: "/alarm-transfer",
    meta: {
      title: "报警转交",
    },
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        sourceApp: __ENV__.applicationCode,
      };
    },
    component: async () =>
      (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-transfer/alarm-transfer")).AlarmTransfer,
  },
  {
    name: "alarm-follow-up",
    path: "/alarm-follow-up",
    meta: {
      title: "报警跟进",
    },
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        sourceApp: __ENV__.applicationCode,
      };
    },
    component: async () =>
      (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-follow-up/alarm-follow-up")).AlarmFollowUp,
  },
  {
    name: "alarm-details",
    path: "/alarm-details",
    meta: {
      title: "报警详情",
    },
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        sourceApp: __ENV__.applicationCode,
      };
    },
    component: async () => (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/details/details")).Details,
  },
];

export const routes: RouteRecordRaw[] = [...routers];
