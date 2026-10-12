import type { RouteRecordRaw } from "vue-router";
const routers: RouteRecordRaw[] = [
  {
    name: "electronicPatrolRecord",
    path: "/electronicPatrolRecord",
    meta: {
      title: "巡更记录",
      isFilter: true,
    },
    component: async () => (await import("@/views/electronic-patrol-list/electronic-patrol-list")).PatrolsList,
  },
  {
    path: "/",
    redirect: "/index",
  },
  {
    path: "/electronicPatrolNFC",
    name: "electronicPatrolNFC",
    component: async () => (await import("@/views/nfc-patrol/index")).Index,
  },
  {
    path: "/electronicPatrolGPS",
    name: "electronicPatrolGPS",
    component: async () => (await import("@/views/gps-patrol/index")).Index,
  },
  {
    path: "/patrol-task-transfer",
    name: "patrol-task-transfer",
    component: async () => (await import("@/views/patrol-task-list/transfer-task")).TransferTask,
    meta: {
      title: "移交任务",
      isFilter: false,
    },
  },
  {
    path: "/patrol-task-dispatch",
    name: "patrol-task-dispatch",
    component: async () => (await import("@/views/patrol-task-list/dispatch-task")).TaskDispatch,
    meta: {
      title: "移交任务",
      isFilter: false,
    },
  },
  {
    path: "/patrol-result",
    name: "patrol-result",
    component: async () => (await import("@/views/patrol-result")).PatrolResult,
  },
  {
    path: "/patrol-task-collaboration",
    name: "patrol-task-collaboration",
    component: async () => (await import("@/views/patrol-task-list/add-collaboration")).AddCollaboration,
    meta: {
      title: "添加协同",
      isFilter: false,
    },
  },
  {
    path: "/electronicPatrolBluetooth",
    name: "electronicPatrolBluetooth",
    component: async () => (await import("@/views/bluetooth-patrol/bluetooth-patrol")).BluetoothPatrol,
  },
  {
    path: "/patrol-task-detail",
    name: "patrol-task-detail",
    component: async () => (await import("@/views/patrol-task-list/task-details/index")).Index,
    meta: {
      title: "任务详情",
      isFilter: true,
    },
  },
  {
    path: "/electronicPatrolTaskList",
    name: "electronicPatrolTaskList",
    component: async () => (await import("@/views/patrol-task-list/index")).Index,
    meta: {
      title: "巡更任务",
      isFilter: true,
    },
  },
  {
    path: "/task-handOver",
    name: "task-handOver",
    component: async () => (await import("@/views/patrol-task-list/dispatch-task/user/user")).TaskHandOver,
    meta: {
      title: "分发人员选择",
      isFilter: true,
    },
  },
  {
    name: "index",
    path: "/index",
    meta: {
      title: "电子巡更",
      isFilter: false,
    },
    component: async () => (await import("@/views/entry/entry")).Entry,
  },
  {
    name: "record-detail",
    path: "/record-detail",
    meta: {
      title: "记录详情",
      isFilter: false,
    },
    component: async () => (await import("@/views/electronic-patrol-list/record-detail/index")).RecordDetail,
  },
];

export const routes: RouteRecordRaw[] = [...routers];
