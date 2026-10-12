import type { AppRoutes } from "@ghcloud/cube-app-generic-component";

const fumigation = async () => (await import("@/views/fumigation")).FumigationOperationH5Entry;

const routers: AppRoutes = [
  {
    name: "index",
    path: "/",
    redirect: "/entry",
  },
  {
    name: "entry",
    path: "/entry",
    meta: {
      title: "熏蒸作业",
    },
    component: async () => (await import("@/views/entry")).Entry,
  },
  {
    name: "works",
    path: "/works",
    meta: {
      title: "作业列表",
    },
    component: fumigation,
  },
  {
    name: "create",
    path: "/create",
    meta: {
      title: "新增熏蒸",
    },
    component: fumigation,
  },
  {
    name: "approval",
    path: "/approval",
    meta: {
      title: "审批页面",
    },
    component: fumigation,
  },
  {
    name: "precheck",
    path: "/precheck",
    meta: {
      title: "三步校验",
    },
    component: fumigation,
  },
  {
    name: "monitor",
    path: "/monitor",
    meta: {
      title: "监护看板",
    },
    component: fumigation,
  },
  {
    name: "realtime",
    path: "/realtime",
    meta: {
      title: "实时态势",
    },
    component: fumigation,
  },
  {
    name: "archive",
    path: "/archive",
    meta: {
      title: "合规档案",
    },
    component: fumigation,
  },
  {
    name: "baseAlarmRecords",
    path: "/baseAlarmRecords?applicationCode=FUMIGATION_OPERATION",
    redirect: "/alarm-list",
  },
  {
    name: "baseAlarmRecords2",
    path: "/baseAlarmRecords",
    redirect: "/alarm-list",
  },
  {
    name: "alarm-list",
    path: "/alarm-list",
    meta: {
      title: "报警记录",
    },
    getQuery: async (): Promise<{ sourceApp: string }> => ({
      sourceApp: __ENV__.applicationCode,
    }),
    component: async () => (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-records")).AlarmRecords,
  },
  {
    name: "alarm-handle",
    path: "/alarm-handle",
    meta: {
      title: "报警处理",
    },
    getQuery: async (): Promise<{ sourceApp: string }> => ({
      sourceApp: __ENV__.applicationCode,
    }),
    component: async () => (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-handle/alarm-handle")).AlarmHandle,
  },
  {
    name: "alarm-transfer",
    path: "/alarm-transfer",
    meta: {
      title: "报警转交",
    },
    getQuery: async (): Promise<{ sourceApp: string }> => ({
      sourceApp: __ENV__.applicationCode,
    }),
    component: async () =>
      (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-transfer/alarm-transfer")).AlarmTransfer,
  },
  {
    name: "alarm-follow-up",
    path: "/alarm-follow-up",
    meta: {
      title: "报警跟进",
    },
    getQuery: async (): Promise<{ sourceApp: string }> => ({
      sourceApp: __ENV__.applicationCode,
    }),
    component: async () =>
      (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-follow-up/alarm-follow-up")).AlarmFollowUp,
  },
  {
    name: "alarm-details",
    path: "/alarm-details",
    meta: {
      title: "报警记录",
    },
    getQuery: async (): Promise<{ sourceApp: string }> => ({
      sourceApp: __ENV__.applicationCode,
    }),
    component: async () => (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/details/details")).Details,
  },
];

export const routes: AppRoutes = [...routers];
