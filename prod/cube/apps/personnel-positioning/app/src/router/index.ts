import type { RouteRecordRaw } from "vue-router";
export const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/realtime" },
  {
    name: "realtime",
    path: "/realtime",
    meta: { title: "实时定位" },
    component: async () => (await import("@/views/realtime/realtime-location/realtime-location")).RealtimeLocation,
  },
  {
    name: "position-alarm-detail",
    path: "/alarms/:id",
    meta: { title: "告警详情" },
    component: async () => (await import("@/views/realtime/alarm-detail/alarm-detail")).PositionAlarmDetail,
  },
  {
    name: "objects",
    path: "/objects",
    meta: { title: "定位对象" },
    component: async () => (await import("@/views/objects/object-list/object-list")).ObjectList,
  },
  {
    name: "devices",
    path: "/devices",
    meta: { title: "定位设备管理" },
    component: async () => (await import("@/views/devices/device-list/device-list")).DeviceList,
  },
  {
    name: "positioning-areas",
    path: "/spaces/:pathMatch(.*)*",
    meta: { title: "定位区域" },
    component: async () => (await import("@/views/areas/area-list")).AreaList,
  },
  {
    name: "person-detail",
    path: "/objects/:id",
    meta: { title: "人员定位详情" },
    component: async () => (await import("@/views/person-detail/person-detail/person-detail")).PersonDetail,
  },
  {
    name: "trajectory",
    path: "/trajectory/:id?",
    meta: { title: "历史轨迹" },
    component: async () => (await import("@/views/trajectory/trajectory-preview/trajectory-preview")).TrajectoryPreview,
  },
  { path: "/:pathMatch(.*)*", redirect: "/realtime" },
];
