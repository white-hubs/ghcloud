import {
  CameraAiInspectionActionStatus,
  CameraAiInspectionActionType,
  CameraAiInspectionCycleType,
  CameraAiInspectionExecutionMode,
  CameraAiInspectionExecutionType,
  CameraAiInspectionTaskCameraStatus,
  CameraAiInspectionTaskStatus,
} from "@ghcloud/cube-service-interface/video-monitor";

export const AI_INSPECTION_PERMISSION_CODES = {
  planView: "aiInspection:plan:view",
  planCreate: "aiInspection:plan:create",
  planUpdate: "aiInspection:plan:update",
  planDelete: "aiInspection:plan:delete",
  planEnable: "aiInspection:plan:enable",
  planRun: "aiInspection:plan:run",
  taskView: "aiInspection:task:view",
  eventView: "aiInspection:event:view",
  eventIgnore: "aiInspection:event:ignore",
  eventAction: "aiInspection:event:action",
} as const;

export const EXECUTION_MODE_OPTIONS = [
  { label: "单次", value: CameraAiInspectionExecutionMode.ONCE },
  { label: "循环", value: CameraAiInspectionExecutionMode.CYCLE },
] as const;

export const CYCLE_TYPE_OPTIONS = [
  { label: "每日", value: CameraAiInspectionCycleType.EVERY_DAY },
  { label: "每周", value: CameraAiInspectionCycleType.EVERY_WEEK },
  { label: "每月", value: CameraAiInspectionCycleType.EVERY_MONTH },
] as const;

export const WEEK_OPTIONS = [
  { label: "周日", value: "SUN" },
  { label: "周一", value: "MON" },
  { label: "周二", value: "TUE" },
  { label: "周三", value: "WED" },
  { label: "周四", value: "THU" },
  { label: "周五", value: "FRI" },
  { label: "周六", value: "SAT" },
] as const;

export const ACTION_TYPE_OPTIONS = [
  { label: "生成报警", value: CameraAiInspectionActionType.ALARM },
  { label: "生成隐患单", value: CameraAiInspectionActionType.WORK_ORDER },
] as const;

export const EXECUTION_MODE_LABEL: Record<CameraAiInspectionExecutionMode, string> = {
  [CameraAiInspectionExecutionMode.ONCE]: "单次",
  [CameraAiInspectionExecutionMode.CYCLE]: "循环",
};

export const CYCLE_TYPE_LABEL: Record<CameraAiInspectionCycleType, string> = {
  [CameraAiInspectionCycleType.EVERY_DAY]: "每日",
  [CameraAiInspectionCycleType.EVERY_WEEK]: "每周",
  [CameraAiInspectionCycleType.EVERY_MONTH]: "每月",
};

export const EXECUTION_TYPE_LABEL: Record<CameraAiInspectionExecutionType, string> = {
  [CameraAiInspectionExecutionType.SCHEDULE]: "定时",
  [CameraAiInspectionExecutionType.IMMEDIATE]: "保存后立即执行",
  [CameraAiInspectionExecutionType.MANUAL]: "手动执行",
};

export const TASK_STATUS_LABEL: Record<CameraAiInspectionTaskStatus, string> = {
  [CameraAiInspectionTaskStatus.PENDING]: "待执行",
  [CameraAiInspectionTaskStatus.RUNNING]: "执行中",
  [CameraAiInspectionTaskStatus.COMPLETED]: "已完成",
  [CameraAiInspectionTaskStatus.PARTIAL_FAILED]: "部分失败",
  [CameraAiInspectionTaskStatus.FAILED]: "执行失败",
  [CameraAiInspectionTaskStatus.TIMEOUT]: "已超时",
};

export const TASK_STATUS_COLOR: Record<CameraAiInspectionTaskStatus, string> = {
  [CameraAiInspectionTaskStatus.PENDING]: "default",
  [CameraAiInspectionTaskStatus.RUNNING]: "blue",
  [CameraAiInspectionTaskStatus.COMPLETED]: "green",
  [CameraAiInspectionTaskStatus.PARTIAL_FAILED]: "orange",
  [CameraAiInspectionTaskStatus.FAILED]: "red",
  [CameraAiInspectionTaskStatus.TIMEOUT]: "red",
};

export const TASK_CAMERA_STATUS_LABEL: Record<CameraAiInspectionTaskCameraStatus, string> = {
  [CameraAiInspectionTaskCameraStatus.PENDING]: "待检测",
  [CameraAiInspectionTaskCameraStatus.RUNNING]: "检测中",
  [CameraAiInspectionTaskCameraStatus.QUALIFIED]: "合格",
  [CameraAiInspectionTaskCameraStatus.ABNORMAL]: "异常",
  [CameraAiInspectionTaskCameraStatus.FAILED]: "失败",
};

export const TASK_CAMERA_STATUS_COLOR: Record<CameraAiInspectionTaskCameraStatus, string> = {
  [CameraAiInspectionTaskCameraStatus.PENDING]: "default",
  [CameraAiInspectionTaskCameraStatus.RUNNING]: "blue",
  [CameraAiInspectionTaskCameraStatus.QUALIFIED]: "green",
  [CameraAiInspectionTaskCameraStatus.ABNORMAL]: "red",
  [CameraAiInspectionTaskCameraStatus.FAILED]: "red",
};

export const ACTION_STATUS_LABEL: Record<CameraAiInspectionActionStatus, string> = {
  [CameraAiInspectionActionStatus.NONE]: "待处理",
  [CameraAiInspectionActionStatus.PENDING]: "生成中",
  [CameraAiInspectionActionStatus.SUCCESS]: "已生成",
  [CameraAiInspectionActionStatus.FAILED]: "生成失败",
  [CameraAiInspectionActionStatus.IGNORED]: "已忽略",
};

export const ACTION_STATUS_COLOR: Record<CameraAiInspectionActionStatus, string> = {
  [CameraAiInspectionActionStatus.NONE]: "default",
  [CameraAiInspectionActionStatus.PENDING]: "blue",
  [CameraAiInspectionActionStatus.SUCCESS]: "green",
  [CameraAiInspectionActionStatus.FAILED]: "red",
  [CameraAiInspectionActionStatus.IGNORED]: "orange",
};

export const ACTION_TYPE_LABEL: Record<CameraAiInspectionActionType, string> = {
  [CameraAiInspectionActionType.ALARM]: "生成报警",
  [CameraAiInspectionActionType.WORK_ORDER]: "生成隐患单",
};

export const DEFAULT_PAGE_SIZE = 10;
