import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    name: "alarm-record",
    path: "/alarm-record",
    meta: {
      title: "报警记录",
    },
    component: async () => (await import("@/views/alarm-record/index")).AlarmRecords,
  },
  {
    name: "alarm-sound",
    path: "/alarm-sound",
    meta: {
      title: "报警音频配置",
    },
    component: async () => (await import("@/views/alarm-sound/index")).AlarmSoundConfig,
  },
  {
    name: "alarm-overview",
    path: "/alarm-overview",
    meta: {
      title: "报警总览",
    },
    component: async () => (await import("@/views/alarm-overview/index")).AlarmOverview,
  },
  {
    name: "alarm-handler-sub-config",
    path: "/alarm-handler-sub-config",
    meta: {
      title: "报警处理提交配置",
    },
    component: async () => (await import("@/views/alarm-handler-config/index")).AlarmHandlerConfig,
  },
  {
    name: "alarm-event-record",
    path: "/alarm-event-record",
    meta: {
      title: "事件记录",
    },
    component: async () => (await import("@/views/alarm-event-record/index")).AlarmEventRecords,
  },
  {
    name: "alarm-event-record-detail",
    path: "/alarm-event-record-detail",
    meta: {
      title: "事件记录详情",
    },
    component: async () => (await import("@/views/alarm-event-record/details")).AlarmEventRecordDetails,
  },
];
