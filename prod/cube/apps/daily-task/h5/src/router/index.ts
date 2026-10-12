import type { RouteRecordRaw } from "vue-router";
const routers: RouteRecordRaw[] = [
  {
    path: "/",
    component: async () => (await import("@/pages/entry/entry")).Entry,
  },
  {
    name: "entry",
    path: "/entry",
    meta: {
      title: "日常任务",
    },
    component: async () => (await import("@/pages/entry/entry")).Entry,
  },
  {
    name: "entry-inspection",
    path: "/entry-inspection",
    meta: {
      title: "日常巡检",
    },
    component: async () => (await import("@/pages/entry/entry-inspection")).Entry,
  },
  {
    name: "task-list",
    path: "/task-list",
    meta: {
      title: "日常任务",
    },
    component: async () => (await import("@/pages/task/list")).TaskList,
  },
  {
    name: "task-inspection-list",
    path: "/task-inspection-list",
    meta: {
      title: "巡检任务",
    },
    component: async () => (await import("@/pages/task/list_inspection")).TaskList,
  },
  {
    name: "task-record",
    path: "/task-record",
    meta: {
      title: "任务记录",
    },
    component: async () => (await import("@/pages/record/record")).TaskRecord,
  },
  {
    name: "task-add",
    path: "/task-add",
    meta: {
      title: "新增任务",
    },
    component: async () => (await import("@/pages/task/add/add")).TaskAdd,
  },
  {
    name: "record-detail",
    path: "/record-detail",
    meta: {
      title: "记录详情",
    },
    component: async () => (await import("@/pages/record/record-detail")).RecordDetail,
  },
  {
    name: "record-repair",
    path: "/record-repair",
    meta: {
      title: "任务处理",
    },
    component: async () => (await import("@/pages/record/repair")).RecordRepair,
  },
  {
    name: "task-add-object",
    path: "/task-add-object",
    meta: {
      title: "任务对象",
    },
    component: async () => (await import("@/pages/task/object/add-object")).TaskAddObject,
  },
  {
    name: "task-add-standard",
    path: "/task-add-standard",
    meta: {
      title: "新增任务标准",
    },
    component: async () => (await import("@/pages/task/standard/standard")).TaskAddStandard,
  },
  {
    name: "task-add-user",
    path: "/task-add-user",
    meta: {
      title: "新增人员",
    },
    component: async () => (await import("@/pages/task/add/user")).TaskAddUser,
  },
  {
    name: "task-detail",
    path: "/task-detail",
    meta: {
      title: "新增人员",
    },
    component: async () => (await import("@/pages/task/detail/detail")).TaskDetail,
  },
  {
    name: "task-feedback",
    path: "/task-feedback",
    meta: {
      title: "任务反馈",
    },
    component: async () => (await import("@/pages/task/detail/task-feedback")).TaskFeedbackPage,
  },
  {
    name: "task-handOver",
    path: "/task-handOver",
    meta: {
      title: "新增人员",
    },
    component: async () => (await import("@/pages/task/detail/user")).TaskHandOver,
  },
  {
    name: "task-execute",
    path: "/task-execute",
    meta: {
      title: "任务处理",
    },
    component: async () => (await import("@/pages/task/detail/execute/execute")).TaskExecute,
  },
  {
    name: "task-drafts",
    path: "/task-drafts",
    meta: {
      title: "草稿箱",
    },
    component: async () => (await import("@/pages/drafts/drafts")).DraftsList,
  },
  {
    name: "task-dispatch",
    path: "/task-dispatch",
    meta: {
      title: "分发",
    },
    component: async () => (await import("@/pages/task/object/dispatch")).TaskDispatch,
  },
  {
    name: "task-handle-detail",
    path: "/task-handle-detail",
    meta: {
      title: "处理详情",
    },
    component: async () => (await import("@/pages/task/detail/execute/execute-detail")).TaskExecuteDetail,
  },
  {
    name: "task-user-select",
    path: "/task-user-select",
    meta: {
      title: "发放人员",
    },
    component: async () => (await import("@/pages/task/add/issuing-user/issuing-user")).IssuingUser,
  },
  {
    name: "task-user-other",
    path: "/task-user-other",
    meta: {
      title: "发放人员",
    },
    component: async () => (await import("@/pages/task/add/issuing-user/user-select")).OtherSelect,
  },
  {
    name: "task-handle-normal",
    path: "/task-handle-normal",
    meta: {
      title: "普通任务处理",
    },
    component: async () => (await import("@/pages/task/detail/execute/execute-nomal")).TaskExecuteNormal,
  },
  {
    name: "task-distribute-user",
    path: "/task-distribute-user",
    meta: {
      title: "指派进度选择",
    },
    component: async () => (await import("@/pages/task/detail/distribute/distribute")).Distribute,
  },
  {
    name: "object-tasks",
    path: "/object-tasks",
    meta: {
      title: "对象任务列表",
    },
    component: async () => (await import("@/pages/object-tasks/index")).ObjectTasks,
  },
];

export const routes: RouteRecordRaw[] = [...routers];
