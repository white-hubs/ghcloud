import type { RouteRecordRaw } from "vue-router";

/** 设备通知路由 */
export const deviceHealthAlarmRoutes: RouteRecordRaw[] = [
  {
    path: "/health-alarm-list",
    name: "DeviceHealthAlarmList",
    component: async () => (await import("@/views/device-health-alarm/alarm-record-list")).DeviceHealthAlarmRecordList,
  },
  {
    path: "/health-alarm-detail",
    name: "DeviceHealthAlarmDetail",
    component: async () => (await import("@/views/device-health-alarm/alarm-record-detail")).DeviceHealthAlarmDetail,
  },
  {
    path: "/health-alarm-config",
    name: "DeviceHealthAlarmConfig",
    component: async () => (await import("@/views/device-health-alarm/alarm-config-list")).DeviceHealthAlarmConfig,
  },
  {
    path: "/health-alarm-config-detail",
    name: "DeviceHealthAlarmConfigDetail",
    component: async () => (await import("@/views/device-health-alarm/alarm-config-detail")).DeviceHealthAlarmConfigDetail,
  },
];
