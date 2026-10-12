import type { RouteRecordRaw } from "vue-router";

export const inspect: RouteRecordRaw[] = [
  {
    path: "/inspect-plan",
    name: "inspect-plan",
    meta: {
      title: "巡检计划",
    },
    component: async () => (await import("@/views/inspect-plan/inspect-plan")).InspectPlan,
  },
  {
    path: "/inspect-plan-edit",
    name: "inspect-plan-edit",
    meta: {
      title: "巡检计划",
    },
    component: async () => (await import("@/views/inspect-plan/inspect-plan-edit/inspect-plan-edit")).InspectPlanEdit,
  },
  {
    path: "/smart-inspect-plan",
    name: "smart-inspect-plan",
    meta: {
      title: "巡检计划",
    },
    component: async () => (await import("@/views/smart-inspect-plan/smart-inspect-plan")).SmartInspectPlan,
  },
  {
    path: "/smart-inspect-plan-edit",
    name: "smart-inspect-plan-edit",
    meta: {
      title: "巡检计划",
    },
    component: async () =>
      (await import("@/views/smart-inspect-plan/smart-inspect-plan-edit/smart-inspect-plan-edit")).SmartInspectPlanEdit,
  },
  {
    path: "/smart-inspect-plan-info",
    name: "smart-inspect-plan-info",
    meta: {
      title: "巡检计划详情",
    },
    component: async () => (await import("@/views/smart-inspect-plan/smart-inspect-plan-info")).SmartInspectPlanInfo,
  },
  {
    path: "/inspect-task",
    name: "inspect-task",
    meta: {
      title: "巡检任务",
    },
    component: async () => (await import("@/views/inspect-task/inspect-task")).InspectTask,
  },
  {
    path: "/inspect-task-edit",
    name: "inspect-task-edit",
    meta: {
      title: "巡检任务",
    },
    component: async () => (await import("@/views/inspect-task/inspect-task-edit/inspect-task-edit")).InspectTaskEdit,
  },
  {
    path: "/inspect-task-info",
    name: "inspect-task-info",
    meta: {
      title: "巡检任务",
    },
    component: async () => (await import("@/views/inspect-task/inspect-task-edit/inspect-task-info")).InspectTaskInfo,
  },
  {
    path: "/smart-inspect-task",
    name: "smart-inspect-task",
    meta: {
      title: "巡检任务",
    },
    component: async () => (await import("@/views/smart-inspect-task/smart-inspect-task")).SmartInspectTask,
  },
  {
    path: "/smart-inspect-task-edit",
    name: "smart-inspect-task-edit",
    meta: {
      title: "巡检任务",
    },
    component: async () =>
      (await import("@/views/smart-inspect-task/smart-inspect-task-edit/smart-inspect-task-edit")).SmartInspectTaskEdit,
  },
  {
    path: "/smart-inspect-task-info",
    name: "smart-inspect-task-info",
    meta: {
      title: "巡检任务",
    },
    component: async () =>
      (await import("@/views/smart-inspect-task/smart-inspect-task-edit/smart-inspect-task-info")).SmartInspectTaskInfo,
  },
  {
    name: "inspect-records",
    path: "/inspect-records",
    meta: {
      title: "巡检记录",
    },
    component: async () => (await import("@/views/inspect-records/inspect-records")).InspectRecords,
  },
  {
    name: "inspect-record-info",
    path: "/inspect-record-info",
    meta: {
      title: "巡检记录详情",
    },
    component: async () => (await import("@/views/inspect-records/record-info/record-info")).RecordInfo,
  },
  {
    name: "inspect-archive",
    path: "/inspect-archive",
    meta: {
      title: "巡检档案",
    },
    component: async () => (await import("@/views/inspect-archive/inspect-archive")).InspectArchive,
  },
  {
    name: "inspect-archive-info",
    path: "/inspect-archive-info",
    meta: {
      title: "巡检档案详情",
    },
    component: async () => (await import("@/views/inspect-archive/archive-info/archive-info")).ArchiveInfo,
  },
  {
    name: "task-standard-abnormal-rate",
    path: "/task-standard-abnormal-rate",
    meta: {
      title: "任务标准项异常率统计",
    },
    component: async () => (await import("@/views/statistic-analysis/task-standard-abnormal-rate")).TaskStandardAbnormalRate,
  },
  {
    name: "plan-statistics",
    path: "/plan-statistics",
    meta: {
      title: "计划统计",
    },
    component: async () => (await import("@/views/statistic-analysis/plan-statistics")).PlanStatistics,
  },
];
