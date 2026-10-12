import { defineComponent } from "vue";
import type { RouteRecordRaw } from "vue-router";

const TaskRecordRedirect = defineComponent({
  setup: () => {
    window.location.replace("/apps/daily-task/h5#/task-record?dailyType=GRID_MANAGE");
    return () => null;
  },
});

const routers: RouteRecordRaw[] = [
  {
    path: "/",
    component: async () => (await import("@/pages/entry")).Entry,
  },
  {
    path: "/my-grid",
    component: async () => (await import("@/pages/my-grid")).MyGrid,
  },
  {
    path: "/grid-handover-record",
    component: async () => (await import("@/pages/grid-handover-record")).GridHandoverRecord,
  },
  {
    path: "/my-grid/handover",
    component: async () => (await import("@/pages/my-grid/handover")).HandOver,
  },
  {
    path: "/my-grid/handover/signature",
    component: async () => (await import("@/pages/my-grid/signature/index")).Signature,
  },
  {
    path: "/grid-list",
    component: async () => (await import("@/pages/grid-list")).GridList,
  },
  {
    path: "/grid-overview",
    component: async () => (await import("@/pages/grid-overview")).GridOverview,
  },
  {
    path: "/grid-list/task-list",
    component: async () => (await import("@/pages/grid-list/task-list")).TaskList,
  },
  {
    path: "/grid-list/info",
    component: async () => (await import("@/pages/grid-list/info/index")).GridInfo,
  },
  {
    path: "/grid-list/takeover",
    component: async () => (await import("@/pages/grid-list/takeover/index")).GridTakeover,
  },
  {
    path: "/grid-list-visual",
    component: async () => (await import("@/pages/grid-list/grid-list-visual")).GridListVisual,
  },
  {
    path: "/grid-list-visual/info",
    component: async () => (await import("@/pages/grid-list/grid-visual-info/index")).GridVisualInfo,
  },
  {
    path: "/grid-task",
    component: async () => (await import("@/pages/grid-task/grid-task")).TaskList,
  },
  {
    path: "/grid-task/add",
    component: async () => (await import("@/pages/grid-task/add-task")).AddTask,
  },
  // {
  //   path: "/task-detail",
  //   component: async () => (await import("@ghcloud/cube-daily-task-h5/src/pages/task/detail/detail")).TaskDetail,
  // },
  // {
  //   path: "/task-handle-normal",
  //   component: async () => (await import("@ghcloud/cube-daily-task-h5/src/pages/task/detail/execute/execute-nomal")).TaskExecuteNormal,
  // },
  {
    path: "/device-list",
    component: async () => (await import("@/pages/sub-pages/device-list/device-list")).DeviceList,
  },
  {
    path: "/alarm-records",
    component: async () => (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-records")).AlarmRecords,
  },
  {
    path: "/alarm-records/detail",
    component: async () => (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/details/details")).Details,
  },
  {
    path: "/alarm-details",
    component: async () => (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/details/details")).Details,
  },
  {
    name: "alarm-transfer",
    path: "/alarm-transfer",
    component: async () =>
      (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-transfer/alarm-transfer")).AlarmTransfer,
  },
  {
    name: "alarm-handle",
    path: "/alarm-handle",
    component: async () => (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-handle/alarm-handle")).AlarmHandle,
  },
  {
    name: "alarm-follow-up",
    path: "/alarm-follow-up",
    component: async () =>
      (await import("@ghcloud/cube-alarm-center-h5/src/views/alarm-records/alarm-follow-up/alarm-follow-up")).AlarmFollowUp,
  },
  {
    path: "/asset-list",
    component: async () => (await import("@ghcloud/cube-asset-management-h5/src/views/asset-list/asset-list")).AssetList,
  },
  {
    path: "/todo-center",
    component: async () => (await import("@ghcloud/cube-todo-center-h5/src/views/todo-center/todo-center")).ToDoCenter,
  },
  {
    path: "/stall-list",
    component: async () => (await import("@/pages/sub-pages/stall-list/stall-list")).StallList,
  },
  {
    path: "/site-point-list",
    component: async () => (await import("@/pages/sub-pages/site-point-list/site-point-list")).SitePointList,
  },
  {
    path: "/patrol-point-list",
    component: async () => (await import("@/pages/sub-pages/patrol-point-list/patrol-point-list")).PatrolPointList,
  },
  {
    path: "/grid-bulletin",
    component: async () => (await import("@/pages/grid-bulletin/index")).GridBulletin,
  },
  {
    path: "/task-record",
    component: TaskRecordRedirect,
  },
];

export const routes: RouteRecordRaw[] = [...routers];
