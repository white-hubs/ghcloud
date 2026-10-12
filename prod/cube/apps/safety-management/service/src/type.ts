/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}
export enum HiddenStatusEnum {
  WAITING_CONFIRM = 'WAITING_CONFIRM',
  WAITING_FOR_HANDLE = 'WAITING_FOR_HANDLE',
  TO_BE_CLOSED = 'TO_BE_CLOSED',
  CONFIRMED = 'CONFIRMED',
  FINISHED = 'FINISHED'
}
export interface HiddenDangerHandleState {
  groupKey: HiddenStatusEnum;
  count: number;
}
export interface HiddenDangerMarketState {
  tenantName: string;
  tenantID: string;
  countStatus: Record<string, number>;
}
export interface RankResult {
  name: string;
  id?: string;
  value: number;
}
export interface LooseWorksRankState {
  pages: number;
  records: {
    chainRatio: number;
    marketName: string;
    marketTenant: number;
    totalNum: number;
  }[];
  total: number;
}
export interface QuotaResItem {
  description: string;
  metric: string;
  result: Record<string, number> | number | { groupKey: string;count: number; }[];
  successful: boolean;
}

export interface AlarmSecurityReportVO {
  createTime?: null | string;
  fileId?: number | null;
  id?: number | null;
  name?: null | string;
}
export interface AlarmTypesResponse {
  /**
   * 报警分类编号
   */
  alarmTypeCode: string;
  /**
   * 报警分类名称
   */
  alarmTypeName: string;
  /**
   * 应用编号
   */
  applicationCode: string;
  /**
   * 应用名称
   */
  applicationName: string;
  id: string;
  /**
   * 备注说明
   */
  remark: string;
}
export interface ProjectTrendStatisticsVO {
  /**
   * 月份
   */
  month?: number | null;
  /**
   * 数量
   */
  num?: number | null;
}

export interface GradedAlarmNum {
  code?: string;
  name?: string;
  alarmNum?: number;
  ratio?: number;
  // 处理率/效率(数量)
  handlerNum?: number;
  // 处理率(百分比)
  handlerRate?: number;
  // 处理效率(百分比)
  avgHandlerDuration?: number;
  // 类型报警
  alarmTypeCode?: string;
  alarmTypeName?: string;
  alarmTypeNumber?: number;
    // 报警类型处理率
    alarmTypeHandlerNumber?: number;
    alarmTypeHandlerRate?:  number;
}
export interface handlerUser {
  userAlarmNumber?: number;
  userHandlerAlarmNumber?: number;
  alarmHandlerUserName?: string;
  userHandlerRate?:number;
  userAvgHandlerDuration?:number
  username?:string;
  onTimeHandlerRate?:number;
  name?:string;
  number?:number;
  rate?:number;
  avgTime?:number
  num?:number;
  type?:string;
  marketName?:string ;
  timeoutRate?:number ;
  userName?:string;
  handlerRate?:number;
}

export interface GradingAlarmIndicatorsData {
// 在线率
  onlineNum?: number;
  onlineRate?: number;
  // 到期率
  expireNum?: number;
  expireRate?: number;
  // 健康度
  healthBelowSixtyNumber?: number;
  healthBelowSixtyRate?: number;
  // 明火烟雾报警数 
  // 
  flameSmogAlarmNum?:number;
  flameSmogAlarmRate?: number;
  // // 其余报警数
  alarmNumber?: number;
  warringRate?: number;
  // 明火烟雾报警点位
  pointNum?: number;
  // 明火烟雾报警处理率
  flameSmogAlarmHandlerRate?: number;
  // 明火烟雾报警处理效率
  flameSmogAlarmAvgHandlerDuration?: number;
  maxHandlerDuration?: number;
  minHandlerDuration?: number;
  // 误报率
  alarmImpracticalNumber?: number;
  alarmImpracticalRate?: number;
  // // 分级
  // gradedAlarmNumList?: GradedAlarmNum[];
  // //类型
  // typeAlarmNumList?: TypeAlarmNum[];
  // 报警总处理率
  alarmHandlerRate?: number;
  // 报警总处理效率
  alarmAvgHandlerDuration?: number;

  // 处理率排名
  topHandlerUsers?:handlerUser[];
  lowHandlerUsers?:handlerUser[];
  
  //一级处理效率排名
  code?:string;
  handlerHighEfficiencyUserName?:string;
  handlerHighEfficiencyUserAvgDuration?:number;
  handlerLowEfficiencyUserName?:string;
  handlerLowEfficiencyUserAvgDuration?:number;
  
  
  convertNumber?: number;
  convertRate?: number;
  convertTime?: number;

  //小散总数
  looseWorkNumber?:number;
  // 小散异常率
  looseWorkAbnormalNumber?: number;
  looseWorkAbnormalRate?: number;

  


  //电子巡更
  electronTotal?:number;
  electronAbnormalRate?:number;
  electronAbnormalNumber?:number;
  electronCompleteNumber?:number;
  electronCompleteRate?:number;
  //隐患整改
  hiddenDangerNumber?:number;
  hiddenDangerCompletedNumber?:number;
  hiddenDangerCompletedRate?:number;
  //故障报修
  faultRepairNumber?:number;
  faultRepairCompletedNumber?:number;
  faultRepairCompletedRate?:number;



  //new
  totalAlarmNumber?:number;
  handlerAlarmNumber?:number;
  handlerRate?:number
  onTimeHandlerNum?:number;
  totalHandlerNum?:number;
  onTimeHandlerRate?:number;
  topUsers?:handlerUser[];
  lowUsers?:handlerUser[];

  // 小散完成率
  looseWorkCompletedRate?: number;
  looseWorkCompletedNumber?: number;

  // 小散整改率
  acceptanceNumber?: number;
  acceptanceRate?: number;
  // 日常巡检
  inspectTaskTotal?:number; 
  inspectTaskHandlerNumber?:number;
  inspectTaskHandledRate?:number
  topHandlerRateDept?:handlerUser[];
  bottomHandlerRateDept?:handlerUser[];
  topHandlerRateUser?:handlerUser[];
  bottomHandlerRateUser?:handlerUser[];
  inspectTaskHandlerTime?:number;
  avgHandlerTime?:number;
  inspectionRecordNum?:number;
  topInspectUser?:handlerUser[];
  bottomInspectUser?:handlerUser[];
  inspectionAbnormalNumber?:number;
  inspectionTotal?:number;
  inspectionAbnormalRate?:number;

  //电子巡更
  patrolTaskTotal?:number;
  patrolTaskHandlerNumber?:number;
  patrolTaskHandledRate?:number;
  patrolTaskTotalTime?:number;
  
  //隐患整改、故障报修
  repairCount?:number;
  handleCount?:number;
  handleRate?:number;
  handleTotalTime?:number;
  topHandlerTypeMetric?:handlerUser[];
  lowHandlerTypeMetric?:handlerUser[];


  // 集团
  topHandlerMarkets?:handlerUser[]
  lowHandlerMarkets?:handlerUser[]
  topOnTimeHandlerUsers?:handlerUser[]
  lowOnTimeHandlerUsers?:handlerUser[]
  lowOnTimeHandlerMarkets?:handlerUser[]
  topOnTimeHandlerMarkets?:handlerUser[]

}
export interface groupDataList{
  marketCode:string;
  marketName:string;
  healthLevel?:number;
  expireRate?:number;
  alarmNumber?:number;
}

export interface GradingAlarmIndicators {
  score:number;
  data:GradingAlarmIndicatorsData | GradedAlarmNum[];
  suggestion:string;
}
export interface ProcessingRate {
  alarmHandlerRate:string
}

export interface HistoryScore{
  endTime:number;
  beginTime:number;
  name:string;
  score:number;
  requestId:string;
  createTime:number;  
  items:HistoryScoreChildren[];
  suggestion:string;
}

export interface HistoryScoreChildren{
  contentTemplate?:string;
  contentVariables?:Record<number, number>;
  displayMetricsEnabled?: boolean;
  displayMetrics?: string;
  displayMetricResults?: Record<string, unknown>;
  topicName:string;
  score:number;
  level:number;
  suggestion:string;
  topicConcat?:string;
  topic:string;
  subTopicCalculateScores:HistoryScoreChildren[];
}

export interface HistoryList {
  pages:number;
  total:number;
  records:HistoryScore[]
}
export interface LibrariesList {
  pages:number;
  total:number;
  records:Libraries[]
}
export interface Libraries {
  allBaseMetricIds:string;
  computeFormula:string;
  code:number;
  computeFormulaMetrics:string;
  computeType:string;
  executableFormula:string;
  id:string;
  initialized:string;
  name:string;
  resultJsonSchema?:string;
  displayEnabled?:boolean;
  usedForDisplay?:boolean;
  forDisplay?:boolean;
  display?:boolean | number;
  metricUsage?:string;
}
export interface RuleLibraries {
  id:string;
  parentId?:string;
  level?: number;
  itemCode?:string;
  itemName:string;
  itemType?:string;
  weightAllot?:string;
  itemCodeConcat?:string;
  computeMetric?:string;
  ruleContentTemplate?:string;
  ruleContentTemplateEnabled?:boolean;
  templateMetricVariables?:string;
  displayMetricsEnabled?:boolean;
  displayMetrics?:string;
  children?:RuleLibraries[];
  coefficients?:{greaterThan:string,lessThanOrEqual:string,scoreRatio:number}[]
}
export interface addRuleLibraries {
  id?:string;
  itemName:string;
  itemCode?:string;
  parentId?:string;
  itemType:string;
  weightAllot?:number;
  computeMetric?:string;
  ruleContentTemplate?:string;
  ruleContentTemplateEnabled?:boolean;
  templateMetricVariables?:string;
  displayMetricsEnabled?:boolean;
  displayMetrics?:string;
  coefficients:{greaterThan:string,lessThanOrEqual:string,scoreRatio:string}[]
}
export interface RuleTemplate {
 contentTemplate:string;
 contentVariables:Record<number, number| TemplateType[]>;
 topicConcat:string;
 displayMetricsEnabled?: boolean;
 displayMetrics?: string;
 displayMetricResults?: Record<string, unknown>;
}
export interface ScoreTemplate {
 score:number;
}
export interface TemplateType {
  marketName?:string;
  name: string;
  num?: number;
  rate?: number;
  avgTime?: string;
}
