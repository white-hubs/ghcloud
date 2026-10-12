import type { ValueType } from 'ant-design-vue/es/vc-cascader/Cascader'
export interface InspectionResultList {
  id: string;
  taskId: string;
  name: string;
  targetNum: number;
  typeName: string;
  inspectionStaff: string;
  checkStaff: string;
  checkResult: string;
  checkMatchRatio: number;
  hiddenDangerNum: number;
  faultNum: number;
  elapsedTime: string;
}

export interface PagesResult {
  pages: number;
  records: unknown[];
  total: number;
}

export interface InspectionDepartment {
  depName: string;
  depId: string;
  coverObjNum: number;
  coverObjRatio: string;
  taskTotalNum: number;
  completeTaskNum: number;
  expireTaskNum: number;
  taskCompleteRatio: string;
  inspectionNum: number;
  inspectionElapsedTime: number;
  checkMatchRatio: string;
  abnormalHiddenDangerNum: number;
  haveDoneHiddenDangerNum: number;
  hiddenDangerDisposeRatio: string;
  validHiddenDangerRatio: string;
}

export interface InspectionPersonnel {
  objId: string;
  depId: string;
  staffId: string;
  staffName: string;
  depName: number;
  depTaskNum: number;
  personageTaskNum: number;
  completeTaskNum: number;
  expireTaskNum: number;
  taskProportion: string;
  taskCompleteRatio: string;
  depInspectionNum: number;
  personageInspectionNum: number;
  personageNumRatio: string;
  inspectionElapsedTime: number;
  abnormalHiddenDangerNum: number;
  haveDoneHiddenDangerNum: number;
  hiddenDangerDisposeRatio: string;
  hiddenDangerValidRatio: string;
}

export interface InspectionTarget {
  objName: string;
  objType: string;
  area: string;
  hiddenDangerDisposeRatio: string;
  inspectionAveTime: string;
  inspectionNum: number;
  taskNum: number;
  abnormalHiddenDangerNum: number;
  validHiddenDangerNum: number;
  processedHiddenDangerNum: number;
  untreatedHiddenDangerNum: number;
  repairsNum: number;
}

export interface InspectionDepartmentTable {
  pages: number;
  records: InspectionDepartment[];
  total: number;
}

export interface DepartmentQeruy {
  pageSize: number;
  pageNumber: number;
  period: string | null;
  depName?: string;
}

export interface PersonnelQeruy {
  pageSize: number;
  pageNumber: number;
  period: string | null;
  depName?: string | undefined;
  name: string;
}
export interface ObjectQeruy {
  pageSize: number;
  pageNumber: number;
  period: string | null;
  name: string;
  objType: string;
  area: string | undefined;
}

export interface TaskDetail {
  taskName: string;
  inspectionType: string;
  taskType: string;
  dutyOfficer: string;
  receiveIds: string;
  publishTime: string;
  taskTimeLimitStr: string;
  progress: string;
  state: string;
  objNum: number;
}
export interface HiddenDangerType {
  submitTime: string;
  name: string;
  hiddenDangerObj: string;
  source: string;
  classify: string;
  levelName: string;
  submitter: string;
  state: string;
  result: string;
}

export interface InspectTop {
  taskName: string;
  releaseTime: string;
  dutyOfficer: string;
  matchRatio: string;
  notMatchNum: string;
}

export interface ProportionOfPlanTypes {
  planType: string;
  planNum: number;
  proportion: string;
}
// 巡检计划
export interface PatrolSchemeType {
  patrolSchemeTotal: number;
  proportionOfPlanTypesVOS: ProportionOfPlanTypes[];
}
// 巡检任务
export interface InspectionTasksType {
  taskTotalNum: number;
  completeTaskNum: number;
  abnormalTaskNum: number;
  expireTaskNum: number;
  taskTotalNumRatio: string;
  completeTaskNumRatio: string;
  completeTaskNumProportion: string;
  abnormalTaskNumRatio: string;
  abnormalTaskNumProportion: string;
  expireTaskNumRatio: string;
  expireTaskNumProportion: string;
  periodTaskNumProportion: string;
  periodTaskNum: number;
}
export interface TrendOfInspectionTimesVOS {
  abscissa: string;
  taskNum: number;
  numberOfInspection: number;
  startTime: number;
  endTime: number;
}
// 巡检次数分析
export interface InspectionsNumber {
  taskTotalNum: number;
  objNum: number;
  inspectionTotalNum: number;
  objCoverageRate: string;
  objCoverageRateRatio: string;
  inspectionTotalNumRatio: string;
  trendOfInspectionTimesVOS: TrendOfInspectionTimesVOS[];
  xData: string[];
  yData1: number[];
  yData2: number[];
}

export interface TaskExecutionAnalysis {
  totalTaskNum: number;
  overTimeTaskNum: number;
  expiredTaskNum: number;
  abnormalTaskNum: number;
  totalTaskNumRatio: string;
}

export interface AddDepTask {
  depName: string;
  depId: string;
  totalTaskNum: string;
  completeTaskNum: string;
  overTimeTaskNum: string;
  expireTaskNum: string;
  taskTotalTime: string;
}

export interface DepTaskExecutionAnalysis {
  maxTaskNumDep: string;
  maxTaskNum: string;
  maxTaskNumRatio: string;
  maxTaskRatioDep: string;
  maxTaskRatio: string;
  maxTaskRatioRatio: string;
  minTaskNumDep: string;
  minTaskNum: string;
  minTaskNumRatio: string;
  minTaskRatioDep: string;
  minTaskRatio: string;
  minTaskRatioRatio: string;
  addDepTask: AddDepTask[];
}
export interface TaskTypeTime {
  inspectionType: string;
  typeId: string;
  taskTimeRatio: string;
  taskTime: number;
  taskTimeHour: string;
}
export interface TaskTimeAnalysis {
  totalElapsedTime: number;
  totalElapsedTimeRatio: string;
  taskTypeTime: TaskTypeTime[];
}

export interface Top5Match {
  taskName: string;
  releaseTime: string;
  dutyOfficer: string;
  matchRatio: string;
  notMatchNum: string;
}
export interface AnalysisOfAuditResults {
  totalCheckTaskNum: number;
  totalCheckTaskNumRatio: string;
  top5Match: Top5Match[];
  last5Match: Top5Match[];
}
export interface InspectionObjTaskAnalysis {
  inspectionTaskTotalNum: number;
  maxTaskNumObj: string;
  maxTaskNum: string;
  maxTaskNumRatio: string;
  minTaskNumObj: string;
  minTaskNumRatio: string;
  minTaskNum: string;
}

export interface InspectionObjAnalysis {
  totalInspectionNum: number;
  maxNum: number;
  minNum: number;
  totalInspectionNumRatio: string;
  maxNumObj: string;
  maxNumRatio: string;
  minNumObj: string;
  minNumRatio: string;
}

export interface InspectionObjAbnormalAnalysis {
  abnormalObjNum: number;
  maxAbnormalObjNum: number;
  minAbnormalObjNum: number;
  abnormalObjNumRatio: string;
  maxAbnormalObj: string;
  maxAbnormalObjNumRatio: string;
  minAbnormalObj: string;
  minAbnormalObjNumRatio: string;
}
export interface ObjInspectionNumTop {
  objId: string;
  objName: string;
  inspectionNum: number;
}

export interface NotHaveTaskAnalysisObj {
  objName: string;
  objType: string;
  area: string;
  belongDep: string;
  lastInspectionTime: string;
}
export interface NotHaveTaskAnalysisTbale {
  total: number;
  records: NotHaveTaskAnalysisObj[];
  pages: number;
}
export interface PointListObj {
  codeNum: string;
  name: string;
  typeName: string;
  depName: string;
  areaId: string;
  areaName: string;
  detailAddress: string;
  id: string;
}
export interface PointListTable {
  total: number;
  records: PointListObj[];
  pages: number;
}
export interface AddSiteType {
  codeNum: string;
  name: string;
  typeId: string|undefined ;
  typeName: string;
  depId: string[];
  depName: string;
  areaId: ValueType;
  detailAddress: string;
  location: string;
  latAndLon: string;
  deviceIdList: string[];
  deviceList: { id: string; name: string; }[];
  id?: number;
}

export interface GetTargetCategory {
  details?: Detail[];
  targetCategory?: string;
}

export interface Detail {
  name?: string;
  num?: string;
  proportion?: string;
}
