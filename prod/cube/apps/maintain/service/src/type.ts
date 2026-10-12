export interface Organization {
  id: string;
  name: string;
}

export interface Position {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
}
export interface HiddenDangerType {
  id: string;
  name: string;
  hiddenDangerCategoryName: string;
  hiddenDangerCategoryId: string | null;
}
export interface HiddenDangerOrderStatVo {
  hiddenTypeName: string;
  totalNumber: number;
  waitNumber: number;
  dealNumber: number;
  dealRate: string;
  avgWaitTime: string;
  totalWaitTime: number;
}
export interface AppointmentList {
  id: string;
  name: string;
  remark: string;
  enable: boolean;
  updateTime: number;
}

export interface PersonItem {
  id: string;
  name: string;
  mobile: string;
  gender: string;
  workStatus: string;
  remark: string;
  username: string;
  password: string;
  enabled: boolean;
  entryDate?: unknown;
  photographKey?: unknown;
  organizations: Organization[];
  managedOrganizations: unknown[];
  organization: { id: string; name: string }[];
  positions: Position[];
  roles: Role[];
  createTime: number;
  lastLoginTime: number;
  fileVO?: { path: string };
  appointmentIds: unknown[];
  appointmentList: AppointmentList[];
  photographList: unknown[];
  tenants: unknown[];
}

export interface PositionItem {
  /**
   * 是否启用
   */
  enabled: string;
  /**
   * 主键
   */
  id: string;
  /**
   * 岗位名称
   */
  name: string;
  /**
   * 岗位备注
   */
  remark: string;
}
export interface HiddenStatisticsType {
  hiddenClassify: { name: string; num: number; ratio: number }[];
  hiddenLevel: { name: string; num: number; ratio: number }[];
}
export interface ReportOverviewType {
  waitingForConfirm: string;
  waitingForHandle: string;
  toBeClosed: string;
  finished: string;
  total: string;
  reportOverviewList: [
    {
      name: string;
      objName: string;
      resource: string;
      submitter: string;
      submitTime: string;
      faultStatus: string;
      faultResult: string;
    },
  ];
  analysisTotal: string;
  analysisFirstName: string;
  analysisList: [
    {
      objType: string;
      objTypeName: string;
      objTypeTotal: string;
      objTypeConfirm: string;
      objTypeHandle: string;
      objTypeClosed: string;
      objTypeFinished: string;
    },
  ];
  analysisAreaTotal: string;
  analysisAreaFirstName: string;
  analysisAreaList: [
    {
      area: string;
      areaName: string;
      objAreaTotal: string;
      objAreaConfirm: string;
      objAreaHandle: string;
      objAreaClosed: string;
      objAreaFinished: string;
    },
  ];
  analysisReason: [
    {
      num: string;
      name: string;
    },
  ];
  title: string;
  titleTime: string;
}
export interface InspectStatistics {
  completeRatio: number;
  abnormalRatio: number;
  thisYearInspectionCount: {
    num: number;
    ratio: number;
  };
  normalCount: {
    num: number;
    ratio: number;
  };
  abnormalCount: {
    num: number;
    ratio: number;
  };
  thisYearInspectionTaskCount: {
    num: number;
    ratio: number;
  };
  ongoingTaskCount: {
    num: number;
    ratio: number;
  };
  expiredTaskCount: {
    num: number;
    ratio: number;
  };
}
export interface InspectRecord {
  [key: string]: unknown;
  id: number;
  taskId: number;
  taskName: string;
  planId: number;
  planName: string;
  targetCategory: string;
  targetId: number;
  targetName: string;
  status: string;
  time: number;
  organizationId: string;
  organizationName: string;
  positionId: string;
  positionName: string;
  userId: string;
  username: string;
  nickname: string;
  itemName: string;
  result: string;
  remark: string;
  createTime: number;
  errValueNum: null;
  areaId: string;
  areaName: string;
  recordItemVOS: [];
  recordToBusinessVOS: [];
  standardVOS: [];
}
export interface PlanAnalysis {
  patrolSchemeTotal: number;
  proportionOfPlanTypesVOS: {
    planType: string;
    planNum: number;
    proportion: string;
  }[];
}
export interface FrequencyAnalysis {
  taskTotalNum: number;
  objNum: number;
  objCoverageRate: string;
  objCoverageRateRatio: string;
  inspectionTotalNum: number;
  inspectionTotalNumRatio: string;
  trendOfInspectionTimesVOS: {
    abscissa: string;
    taskNum: number;
    numberOfInspection: number;
    startTime: number;
    endTime: number;
  }[];
}
export interface TaskAnalysis {
  taskTotalNum: number;
  taskTotalNumRatio: string;
  completeTaskNum: number;
  completeTaskNumRatio: string;
  completeTaskNumProportion: string;
  abnormalTaskNum: number;
  abnormalTaskNumRatio: string;
  abnormalTaskNumProportion: string;
  expireTaskNum: number;
  expireTaskNumRatio: string;
  expireTaskNumProportion: string;
  periodTaskNum: number;
  taskNum: number;
  periodTaskNumProportion: string;
}
export interface DepTaskExecution {
  maxTaskNumDep: string;
  maxTaskNum: number;
  maxTaskNumRatio: string;
  maxTaskRatioDep: string;
  maxTaskRatio: string;
  maxTaskRatioRatio: string;
  minTaskNumDep: string;
  minTaskNum: number;
  minTaskNumRatio: string;
  minTaskRatioDep: string;
  minTaskRatio: string;
  minTaskRatioRatio: string;
  addDepTask: {
    depName: string;
    depId: string;
    totalTaskNum: number;
    completeTaskNum: number;
    overTimeTaskNum: number;
    expireTaskNum: number;
    taskTotalTime: number;
    taskTotalTimeStr: string;
    taskCompleteRatio: string;
  }[];
}
export interface TaskTime {
  totalElapsedTime: number;
  totalElapsedTimeRatio: string;
  taskTypeTime: {
    inspectionType: string;
    typeId: string;
    taskTime: number;
    taskTimeHour: number;
    taskTimeRatio: string;
  }[];
}
export interface AnalysisOfAudit {
  totalCheckTaskNum: number;
  totalCheckTaskNumRatio: string;
  top5Match: {
    taskName: string;
    releaseTime: string;
    dutyOfficer: string;
    matchRatio: string;
    notMatchNum: number;
  }[];
  last5Match: {
    taskName: string;
    releaseTime: string;
    dutyOfficer: string;
    matchRatio: string;
    notMatchNum: number;
  }[];
}
export interface TaskExecution {
  totalTaskNum: number;
  overTimeTaskNum: number;
  expiredTaskNum: number;
  abnormalTaskNum: number;
  totalTaskNumRatio: string;
}
export interface TargetCategory {
  targetCategory: string;
  details: {
    name: string;
    num: number;
    proportion: string;
  }[];
}
export interface ObjAnalysis {
  totalInspectionNum: number;
  totalInspectionNumRatio: string;
  maxNumObj: string;
  maxNum: number;
  maxNumRatio: string;
  minNumObj: string;
  minNum: number;
  minNumRatio: string;
}
export interface InspectionNum {
  objId: string;
  objName: string;
  inspectionNum: number;
}
export interface ObjAbnormal {
  abnormalObjNum: number;
  abnormalObjNumRatio: string;
  maxAbnormalObj: string;
  maxAbnormalObjNum: number;
  maxAbnormalObjNumRatio: string;
  minAbnormalObj: string;
  minAbnormalObjNum: number;
  minAbnormalObjNumRatio: string;
}
export interface ObjTask {
  inspectionTaskTotalNum: number;
  maxTaskNumObj: string;
  maxTaskNum: number;
  maxTaskNumRatio: string;
  minTaskNumObj: string;
  minTaskNum: number;
  minTaskNumRatio: string;
}
export interface RecordDetailResult {
  /**
   * 所在区域
   */
  areaName?: null | string;
  /**
   * 巡检结果异常次数
   */
  dailyErrNum?: number | null;
  /**
   * 日常巡检记录
   */
  dailyList?: InspectRecordVO[] | null;
  /**
   * 日常巡检次数
   */
  dailyNum?: number | null;
  id?: number | null;
  /**
   * 所属机构名称
   */
  organizationName?: null | string;
  /**
   * 巡检结果
   */
  result?: Result;
  /**
   * 对象类型
   */
  targetCategory?: TargetCategory;
  /**
   * 对象id
   */
  targetId?: number | null;
  /**
   * 对象名称
   */
  targetName?: null | string;
  /**
   * 临时巡检结果异常数
   */
  temporaryErrNum?: number | null;
  /**
   * 临时巡检记录
   */
  temporaryList?: InspectRecordVO[] | null;
  /**
   * 临时巡检次数
   */
  temporaryNum?: number | null;
  /**
   * 最后一次巡检时间
   */
  time?: null | string;
}

export interface InspectRecordVO {
  /**
   * 设备区域id
   */
  areaId?: null | string;
  /**
   * 设备区域名称
   */
  areaName?: null | string;
  /**
   * 创建时间
   */
  createTime?: null | string;
  /**
   * 异常项数量
   */
  errValueNum?: number | null;
  id?: number | null;
  /**
   * 巡检项名称
   */
  itemName?: null | string;
  /**
   * 用户姓名
   */
  nickname?: null | string;
  /**
   * 组织机构ID
   */
  organizationId?: number | null;
  /**
   * 组织机构名
   */
  organizationName?: null | string;
  /**
   * 计划ID
   */
  planId?: number | null;
  /**
   * 计划名
   */
  planName?: null | string;
  /**
   * 岗位ID
   */
  positionId?: number | null;
  /**
   * 岗位名
   */
  positionName?: null | string;
  /**
   * 记录项
   */
  recordItemVOS?: InspectRecordItemVO[] | null;
  /**
   * 记录转其他业务记录
   */
  recordToBusinessVOS?: InspectRecordToBusinessVO[] | null;
  /**
   * 备注
   */
  remark?: null | string;
  /**
   * 巡检结果
   */
  result?: null | string;
  /**
   * 记录标准
   */
  standardVOS?: InspectRecordStandardVO[] | null;
  /**
   * 状态
   */
  status?: null | string;
  /**
   * 目标对象类型
   */
  targetCategory?: null | string;
  /**
   * 目标对象ID
   */
  targetId?: number | null;
  /**
   * 目标对象名
   */
  targetName?: null | string;
  /**
   * 任务ID（临时巡检没有任务ID）
   */
  taskId?: number | null;
  /**
   * 任务名称
   */
  taskName?: null | string;
  /**
   * 巡检时间
   */
  time?: null | string;
  /**
   * 用户ID
   */
  userId?: number | null;
  /**
   * 用户名
   */
  username?: null | string;
}

export interface InspectRecordItemVO {
  /**
   * 异常说明
   */
  errorDesc?: null | string;
  /**
   * 0 不是  1 是
   */
  errorValueFlag?: boolean | null;
  /**
   * 文件集合
   */
  fileVOS?: FileVO[] | null;
  id?: number | null;
  /**
   * 巡检项ID
   */
  itemId?: number | null;
  /**
   * 是否强制拍照 0 否 1是
   */
  itemImageFlag?: boolean | null;
  /**
   * 巡检项名称
   */
  itemName?: null | string;
  /**
   * 巡检结果Id
   */
  itemResultId?: number | null;
  /**
   * 巡检项结果名称
   */
  itemResultName?: null | string;
  /**
   * 巡检项结果值
   */
  itemResultValue?: null | string;
  /**
   * 巡检记录ID
   */
  recordId?: number | null;
  /**
   * 巡检标准ID
   */
  standardId?: number | null;
  /**
   * 巡检标准名称
   */
  standardName?: null | string;
  /**
   * 是否临时添加标准
   */
  tempAddFlag?: boolean | null;
}

export interface FileVO {
  /**
   * 业务主键
   */
  businessKey?: number;
  /**
   * 主键
   */
  id?: number;
  /**
   * 文件名
   */
  name?: string;
  /**
   * URL地址
   */
  path?: string;
  /**
   * 关联数量
   */
  refCount?: number;
  /**
   * 文件大小
   */
  size?: number;
  /**
   * 文件名后缀
   */
  suffix?: string;
  /**
   * 文件类型
   */
  type?: string;
}

export interface InspectRecordToBusinessVO {
  /**
   * 业务分类 工单（ticket）
   */
  businessCategory?: null | string;
  /**
   * 业务是否存在, 可用于是否能跳转到详情
   */
  businessExist?: boolean | null;
  /**
   * 业务ID
   */
  businessId?: null | string;
  /**
   * 业务对象名称
   */
  businessName?: null | string;
  /**
   * 业务状态
   */
  businessStatus?: null | string;
  /**
   * 业务时间
   */
  businessTime?: null | string;
  /**
   * 创建时间
   */
  createTime?: null | string;
  /**
   * 巡检记录ID
   */
  recordId?: number | null;
  /**
   * 目标对象类别
   */
  targetCategory?: null | string;
  /**
   * 目标对象ID
   */
  targetId?: number | null;
  /**
   * 目标对象名称
   */
  targetName?: null | string;
}

export interface InspectRecordStandardVO {
  /**
   * 巡检标准名称
   */
  itemVOS?: InspectRecordStandardItemVO[] | null;
  /**
   * 巡检标准ID
   */
  standardId?: number | null;
  /**
   * 巡检标准名称
   */
  standardName?: null | string;
  /**
   * 是否临时添加标准
   */
  tempAddFlag?: boolean | null;
}
export interface InspectRecordStandardItemVO {
  /**
   * 异常说明
   */
  errorDesc?: null | string;
  /**
   * 0 不是  1 是
   */
  errorValueFlag?: boolean | null;
  /**
   * 文件集合
   */
  fileVOS?: FileVO[] | null;
  /**
   * 巡检项ID
   */
  itemId?: number | null;
  /**
   * 是否强制拍照 0 否 1是
   */
  itemImageFlag?: boolean | null;
  /**
   * 巡检项名称
   */
  itemName?: null | string;
  /**
   * 巡检结果Id
   */
  itemResultId?: number | null;
  /**
   * 巡检项结果名称
   */
  itemResultName?: null | string;
  /**
   * 巡检项结果值
   */
  itemResultValue?: null | string;
}

/**
 * 巡检结果
 */
export enum Result {
  ABNORMAL = "ABNORMAL",
  NORMAL = "NORMAL",
  UNKNOWN = "UNKNOWN",
}
export interface TicketStatisticsVo {
  /**
   * 故障工单数
   */
  faultNum?: number;
  /**
   * 故障工单百分比
   */
  faultRate?: number;
  /**
   * 日常巡检工单数
   */
  inspectNum?: number;
  /**
   * 日常巡检比例
   */
  inspectRate?: number;
  /**
   * 维保作业工单数
   */
  maintenanceNum?: number;
  /**
   * 维保作业比例
   */
  maintenanceRate?: number;
  /**
   * 工单总数
   */
  total?: number;
}
export interface FaultObjectTop5Vo {
  /**
   * 故障数量
   */
  faultNum?: number;
  /**
   * 故障对象
   */
  faultObject?: string;
}
export interface FaultHandleStatusStatisticsVo {
  /**
   * 数量
   */
  num?: number;
  /**
   * 状态比例
   */
  rate?: number;
  /**
   * 状态名称 WAITING:处理中 REJECT:驳回 UNDO:撤销 PASS:完成
   */
  statusType?: FaultHandleStatus;
}
// 故障状态定义成枚举
export enum FaultHandleStatus {
  HANDLING = "HANDLING",
  REJECT = "REJECT",
  UNDO = "UNDO",
  PASS = "PASS",
}
export const FaultHandleStatusMap = new Map([
  [FaultHandleStatus.HANDLING, "处理中"],
  [FaultHandleStatus.REJECT, "驳回"],
  [FaultHandleStatus.UNDO, "撤销"],
  [FaultHandleStatus.PASS, "完成"],
]);
export interface MaintenanceStatisticsVo {
  /**
   * 天
   */
  date?: string;
  /**
   * 维护数量
   */
  num?: number;
}

export interface InspectTaskTop5Vo {
  /**
   * 已完成任务数
   */
  finishNum?: number;
  /**
   * 人员名称
   */
  name?: string;
  /**
   * 总任务数
   */
  total?: number;
}

export interface InspectTaskTrendVo {
  /**
   * 天
   */
  date?: string;
  /**
   * 异常数量
   */
  exceptionNum?: number;
  /**
   * 巡检任务数量
   */
  inspectNum?: number;
}
export interface PatrolPointDTO {
  id: string;
  codeNum: string;
  name: string;
  typeName: string;
  typeId: string;
  depName: string;
  depId: string;
  areaId: string;
  areaName: string;
  detailAddress: string;
  location: string;
  latAndLon: string;
}

/**
 * AreaDTO
 */
export interface AreaDTO {
  areaManagerId?: string;
  /**
   * 子节点列表
   */
  children?: AreaDTO[];
  /**
   * 区域编号
   */
  code?: string;
  deptIds?: number[];
  deptNames?: string;
  /**
   * 是否启用
   */
  enabled?: boolean;
  /**
   * 主键
   */
  id?: number;
  /**
   * 树层级
   */
  level?: number;
  /**
   * 区域名称
   */
  name?: string;
  /**
   * 上级主键
   */
  parentId?: number;
  /**
   * 序列号
   */
  sequence?: string;
  /**
   * 标签名称
   */
  tagNames?: string;
  typeId?: string;
  typeName?: string;
}

export interface PatrolLocationVO {
  /**
   * 区域
   */
  area?: AreaDTO[];
  areaId?: string;
  areaName?: string;
  /**
   * 蓝牙编号
   */
  bluetoothCode?: string;
  /**
   * 创建时间
   */
  createTime?: string;
  departmentIds?: number[];
  departmentNames?: string;
  /**
   * 巡更设备编号
   */
  deviceCode?: string;
  /**
   * 巡更设备id
   */
  deviceId?: number;
  /**
   * 主键
   */
  id?: number;
  name?: string;
  /**
   * nfc芯片编码
   */
  nfcCode?: string;
  /**
   * 纬度
   */
  patrolDimension?: string;
  /**
   * 巡更点名称
   */
  patrolLocationName?: string;
  /**
   * 经度
   */
  patrolLongitude?: string;
  /**
   * 说明
   */
  remarks?: string;
  /**
   * 标签ID
   */
  tagIds?: number[];
  /**
   * 标签名称
   */
  tagNames?: string;
  typeId?: string;
  typeName?: string;
}
