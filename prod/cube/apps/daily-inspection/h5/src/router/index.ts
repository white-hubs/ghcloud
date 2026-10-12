import type { RouteRecordRaw } from "vue-router";
const routers: RouteRecordRaw[] = [
  {
    redirect: "/entry",
    path: "/",
  },
  {
    name: "entry",
    path: "/entry",
    meta: {
      title: "日常巡检",
    },
    component: async () => (await import("@/views/entry/entry")).Entry,
  },
  {
    name: "patrolInspectTaskList",
    path: "/patrolInspectTaskList",
    redirect: "/my-inspection",
  },
  {
    name: "my-inspection",
    path: "/my-inspection",
    meta: {
      title: "我的巡检",
      isFilter: false,
      description: "巡检任务",
    },
    component: async () => (await import("@/views/my-inspection/list")).MyInspection,
  },
  {
    path: "/my-inspection/file-detail",
    meta: {
      title: "档案详情",
    },
    component: async () => (await import("@/views/my-inspection/detail")).InspectionList,
  },
  {
    name: "inspection-detail",
    path: "/inspection-detail",
    meta: {
      title: "巡检任务详情",
    },
    component: async () => (await import("@/views/inspection-detail/detail")).InspectionDetail,
  },
  {
    name: "complete-inspection",
    path: "/complete-inspection",
    meta: {
      title: "巡检完成",
    },
    component: async () => (await import("@/views/complete-inspection/complete-inspection")).CompleteInspection,
  },
  {
    name: "temporary-inspection-complete",
    path: "/temporary-inspection-complete",
    meta: {
      title: "巡检完成",
    },
    component: async () =>
      (await import("@/views/temporary-inspection-complete/temporary-inspection-complete")).TemporaryInspectionComplete,
  },
  {
    name: "choice-staff",
    path: "/choice-staff",
    meta: {
      title: "选择人员",
    },
    component: async () => (await import("@/views/choice-staff/choice-staff")).ChoiceStaff,
  },
  {
    name: "user",
    path: "/user",
    meta: {
      title: "新选择人员",
    },
    component: async () => (await import("@/views/user/user")).User,
  },
  {
    name: "inspection-record",
    path: "/inspection-record",
    meta: {
      title: "巡检详情",
      isFilter: true,
    },
    component: async () => (await import("@/views/inspection-record/inspection-record")).InspectionRecord,
  },
  {
    name: "inspection-cancel",
    path: "/inspection-cancel",
    meta: {
      title: "取消修复",
    },
    component: async () => (await import("@/views/inspection-record/inspection-cancel")).InspectionRecordCancel,
  },
  {
    name: "inspection-execute",
    path: "/inspection-execute",
    meta: {
      title: "执行巡检",
      isFilter: false,
    },
    component: async () => (await import("@/views/inspection-execute/inspection-execute")).InspectionExecute,
  },
  {
    name: "ai-inspection-result",
    path: "/ai-inspection-result",
    meta: {
      title: "智能巡检结果",
      isFilter: false,
    },
    component: async () => (await import("@/views/ai-inspection-result/ai-inspection-result")).AiInspectionResult,
  },
  {
    name: "scene-point-detail",
    path: "/scene-point-detail",
    meta: {
      title: "现场点详情",
    },
    component: async () => (await import("@/views/scene-point/detail")).ScenePointDetail,
  },
  {
    name: "patrolInspectArchives",
    path: "/patrolInspectArchives",
    redirect: "/inspection-files",
  },
  {
    name: "inspection-files",
    path: "/inspection-files",
    meta: {
      title: "巡检档案",
      isFilter: true,
    },
    component: async () => (await import("@/views/inspection-files/inspection-files")).FileList,
  },
  {
    name: "file-detail",
    path: "/file-detail",
    component: async () => (await import("@/views/inspection-files/file-detail/index")).FileDetail,
    meta: {
      title: "详情",
    },
  },
  {
    name: "inspection-logs",
    path: "/inspection-logs",
    meta: {
      title: "巡检记录",
      isFilter: true,
    },
    component: async () => (await import("@/views/inspection-logs/inspection-logs")).InspectionLogs,
  },
  {
    name: "patrolInspectRecord",
    path: "/patrolInspectRecord",
    redirect: "/standing-book",
  },
  {
    name: "standing-book",
    path: "/standing-book",
    meta: {
      title: "巡检台账",
      isFilter: true,
    },
    component: async () => (await import("@/views/standing-book/standing-book")).StandingBook,
  },
  {
    name: "patrolInspectAnalysis",
    path: "/patrolInspectAnalysis",
    redirect: "/analysis",
  },
  {
    name: "analysis",
    path: "/analysis",
    meta: {
      title: "巡检分析",
    },
    component: async () => (await import("@/views/analysis/analysis")).Analysis,
  },
  {
    name: "inspection-object",
    path: "/inspection-object",
    meta: {
      title: "选择巡检任务",
    },
    component: async () => (await import("@/views/inspection-object/inspection-object")).InspectionObject,
  },
  {
    name: "temporary-inspection",
    path: "/temporary-inspection",
    meta: {
      title: "临时巡检",
    },
    component: async () => (await import("@/views/temporary-inspection/list")).TemporaryInspectionList,
  },
  {
    name: "abnormal-inspection",
    path: "/abnormal-inspection",
    meta: {
      title: "异常对象",
      isFilter: true,
    },
    component: async () => (await import("@/views/exception-handling/list")).ExceptionHandlingList,
  },
  {
    name: "abnormal-inspection/detial",
    path: "/abnormal-inspection/detail",
    meta: {
      title: "异常对象详情",
    },
    component: async () => (await import("@/views/exception-handling/detail")).ExceptionHandlingDetail,
  },
  {
    name: "abnormal-inspection/handle",
    path: "/abnormal-inspection/handle",
    meta: {
      title: "异常对象处理",
    },
    component: async () => (await import("@/views/exception-handling/handle")).ExceptionBatchHandle,
  },
];

export const routes: RouteRecordRaw[] = [...routers];
