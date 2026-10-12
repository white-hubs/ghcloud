export interface InspectTaskStatusStatParams extends Record<string, unknown> {
  period?: string;
  droneInspection?: boolean;
  robotDogInspection?: boolean;
}

export interface InspectTaskPeriodParams extends Record<string, unknown> {
  period?: string;
}

export interface InspectTaskStatusStatVO {
  totalCount?: number | string | null;
  completedCount?: number | string | null;
  uncompletedCount?: number | string | null;
  timeoutCount?: number | string | null;
  completedRate?: number | string | null;
}

export interface PageResult<T> {
  total?: number;
  pages?: number;
  records?: T[];
}

export type InspectionMode = "MANUAL" | "DRONE" | "HYBRID" | string;

export interface InspectTaskPageParams extends Record<string, unknown> {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
  typeId?: string;
  status?: string;
  period?: string;
  droneInspection?: boolean;
  robotDogInspection?: boolean;
  autoInspectionDeviceId?: string | number;
  autoInspectionCarrierType?: "DRONE" | "ROBOT_DOG" | string;
  taskTimeout?: "TIMEOUT" | "NO_TIMEOUT" | string;
}

export interface InspectTaskTargetListParams extends Record<string, unknown> {
  taskId: number | string;
}

export interface InspectTaskDetailParams extends Record<string, unknown> {
  id: number | string;
  businessType?: string;
  notTarget?: boolean;
}

export interface WaypointPageParams extends Record<string, unknown> {
  inspectTaskId: number | string;
  pageNumber: number;
  pageSize: number;
}

export interface RobotDogPointPageParams extends Record<string, unknown> {
  inspectTaskId: number | string;
  pageNumber: number;
  pageSize: number;
}

export interface InspectTaskDepartmentMemberCompletionStatParams extends InspectTaskPeriodParams {
  deptId: number | string;
}

export interface InspectTaskTargetGeneratedListParams extends Record<string, unknown> {
  targetCategory: string;
}

export interface InspectTaskLatestAbnormalTargetListParams extends Record<string, unknown> {
  targetCategory?: string;
}

export interface TaskDetailResult {
  [key: string]: unknown;
  id?: number | string | null;
  name?: string | null;
  typeName?: string | null;
  level?: "GENERAL" | "URGENT" | string | null;
  status?: string | null;
  receiveIds?: string | null;
  receiveNames?: string | null;
  inspectionMode?: InspectionMode | null;
  targetNum?: number | string | null;
  validBeginTime?: number | string | null;
  validEndTime?: number | string | null;
  beginTime?: number | string | null;
  endTime?: number | string | null;
  createTime?: number | string | null;
}

export interface WaypointResult {
  [key: string]: unknown;
  id?: number | string | null;
  taskId?: number | string | null;
  routeId?: number | string | null;
  seqNo?: number | string | null;
  waypointName?: string | null;
  name?: string | null;
  mapLng?: number | string | null;
  mapLat?: number | string | null;
  actualLng?: number | string | null;
  actualLat?: number | string | null;
  actualHeight?: number | string | null;
  longitude?: number | string | null;
  latitude?: number | string | null;
  height?: number | string | null;
  status?: string | null;
  result?: string | null;
  inspectResult?: string | null;
  inspectTime?: number | string | null;
  finishTime?: number | string | null;
}

export interface RobotDogPointResult extends WaypointResult {
  pointId?: number | string | null;
  pointName?: string | null;
  routePointName?: string | null;
  commandLng?: number | string | null;
  commandLat?: number | string | null;
  commandHeight?: number | string | null;
  waypointId?: number | string | null;
  waypointName?: string | null;
  photoStatus?: string | null;
  recordStatus?: string | null;
  inspectionStatus?: string | null;
}

export interface TaskTargetRelationPO {
  deleted?: boolean | null;
  createBy?: string | null;
  createTime?: string | null;
  updateBy?: string | null;
  updateTime?: string | null;
  creatorId?: string | null;
  creatorType?: "USER" | "CLIENT" | "SYSTEM" | "UNKNOWN" | string | null;
  updaterId?: string | null;
  updaterType?: "USER" | "CLIENT" | "SYSTEM" | "UNKNOWN" | string | null;
  tenant?: number | string | null;
  id?: number | string | null;
  planId?: number | string | null;
  taskId?: number | string | null;
  targetCategory?: "STALL" | "DEVICE" | "PROPERTY" | "SITE_POINT" | "RISK_SOURCE" | "SMALL_ENGINEERING" | string | null;
  targetType?: string | null;
  targetId?: number | string | null;
  targetCode?: string | null;
  targetName?: string | null;
  latAndLon?: string | null;
  location?: string | null;
  targetParentId?: number | string | null;
  targetAddress?: string | null;
  targetAreaId?: string | null;
  targetAreaName?: string | null;
}

export interface OverviewMetric {
  total?: number | string | null;
  chainRatio?: number | string | null;
}

export interface InspectAbnormalOverviewVO {
  abnormalTask?: OverviewMetric | null;
  abnormalPoint?: OverviewMetric | null;
}

export interface InspectTaskTypeDistributionVO {
  typeId?: number | string | null;
  typeName?: string | null;
  taskTotal?: number | string | null;
}

export interface InspectTaskDepartmentCompletionStatVO {
  deptId?: number | string | null;
  deptName?: string | null;
  taskTotal?: number | string | null;
  completedTaskTotal?: number | string | null;
}

export interface InspectTaskDepartmentMemberCompletionStatVO {
  memberId?: number | string | null;
  memberName?: string | null;
  taskTotal?: number | string | null;
  completedTaskTotal?: number | string | null;
  completionRate?: number | string | null;
  completionText?: string | null;
}

export interface InspectGeneratedTaskTargetVO {
  id?: number | string | null;
  name?: string | null;
  code?: string | null;
  type?: string | null;
  typeName?: string | null;
  latAndLon?: string | null;
  location?: string | null;
}

export interface TransferTaskParams extends Record<string, unknown> {
  id: string;
  userId: string;
}

export interface StopInspectTaskParams extends Record<string, unknown> {
  id: string;
  businessType?: string;
}
