/** 通用分页 */
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}

export interface RiskIndexVO {
  marketName?: null | string;
  marketTenant?: number | null;
  riskIndex?: number | null;
  status?: boolean | null;
}
export interface RiskCountStatusType {
  status: string;
  count: number;
}
export interface MOMRatio {
  title: string;
  imgSrc: string;
  value: number;
  unit: string;
  qoq: number;
}

export interface RiskIndexDetailVO {
  /**
   * 报警情况
   */
  alarmSituationRiskIndex: AlarmSituationRiskIndex;
  /**
   * 报警未响应情况
   */
  alarmUnConfirmedRiskIndex: AlarmUnConfirmedRiskIndex;
  /**
   * 隐患情况
   */
  hiddenDangerRiskIndex: HiddenDangerRiskIndex;
  /**
   * 隐患未响应情况
   */
  hiddenDangerUnConfirmedRiskIndex: HiddenDangerUnConfirmedRiskIndex;
  /**
   * 风险源建档情况
   */
  propertyFilingRiskIndex: PropertyFilingRiskIndex;
  /**
   * 风险指数得分
   */
  riskIndex: number;
}

/**
* 报警情况
*/
export interface AlarmSituationRiskIndex {
  /**
   * 级别得分情况
   */
  alarmLevelIndexDetails: AlarmSituationRiskIndexAlarmLevelIndexDetail[];
  /**
   * 报警情况得分
   */
  riskIndex: number;
}

export interface AlarmSituationRiskIndexAlarmLevelIndexDetail {
  /**
   * 报警级别编号
   */
  alarmLevel: AlarmLevel;
  /**
   * 分数
   */
  riskIndex: number;
  /**
   * 报警总数
   */
  totalNum: number;
}

/**
* 报警级别编号
*/
export enum AlarmLevel {
  ONE_LEVEL = 'ONE_LEVEL',
  THREE_LEVEL_AND_FOUR_LEVEL = 'THREE_LEVEL_AND_FOUR_LEVEL',
  TWO_LEVEL = 'TWO_LEVEL',
}

/**
* 报警未响应情况
*/
export interface AlarmUnConfirmedRiskIndex {
  /**
   * 级别得分情况
   */
  alarmLevelIndexDetails: AlarmUnConfirmedRiskIndexAlarmLevelIndexDetail[];
  /**
   * 报警情况得分
   */
  riskIndex: number;
}

export interface AlarmUnConfirmedRiskIndexAlarmLevelIndexDetail {
  /**
   * 报警级别编号
   */
  alarmLevel: AlarmLevel;
  /**
   * 分数
   */
  riskIndex: number;
  /**
   * 报警总数
   */
  totalNum: number;
}

/**
* 隐患情况
*/
export interface HiddenDangerRiskIndex {
  /**
   * 隐患情况得分
   */
  riskIndex: number;
  /**
   * 隐患数量
   */
  totalNum: number;
}

/**
* 隐患未响应情况
*/
export interface HiddenDangerUnConfirmedRiskIndex {
  /**
   * 隐患未响应得分
   */
  riskIndex: number;
  /**
   * 隐患数量
   */
  totalNum: number;
}

/**
* 风险源建档情况
*/
export interface PropertyFilingRiskIndex {
  /**
   * 建档类型得分明细
   */
  propertyCategoryDetails: FilingPropertyCategoryDetail[];
  /**
   * 风险源建档得分
   */
  riskIndex: number;
}

export interface FilingPropertyCategoryDetail {
  /**
   * 类型编码
   */
  propertyCategory: FilingPropertyCategory;
  /**
   * 类型得分
   */
  riskIndex: number;
}

/**
* 类型编码
*/
export enum FilingPropertyCategory {
  ELECTRIC_VEHICLE = 'ELECTRIC_VEHICLE',
  FIRE_FIGHTING_EQUIPMENT = 'FIRE_FIGHTING_EQUIPMENT',
  FLAMMABLE_EQUIPMENT = 'FLAMMABLE_EQUIPMENT',
}

export interface SafetyAnalysisAlarmRatioVO {
  chainRatio: number;
  /**
   * 已处理报警数环比
   */
  handlerChainRatio: number;
  /**
   * 已处理报警数
   */
  handlerNum: number;
  /**
   * 报警总数
   */
  totalNum: number;
  /**
   * 未处理报警环比
   */
  unHandlerChainRatio: number;
  /**
   * 未处理报警数
   */
  unHandlerNum: number;
}
export interface SafetyAlarmEventTypeRatioVO {
  /**
   * 事件主键
   */
  id?: null | string;
  /**
   * 名称
   */
  name?: null | string;
  /**
   * 占比
   */
  ratio?: number | null;
  /**
   * 数量
   */
  totalNum?: number | null;
}
export interface SafetyMarketStatisticsCardVO {
  /**
   * 报警任务数
   */
  alarmTaskNum?: number | null;
  /**
   * 建档设备数
   */
  deviceFilingNum?: number | null;
  /**
   * 安全教育任务数
   */
  educationTaskNum?: number | null;
  /**
   * 隐患任务数
   */
  hiddenTaskNum?: number | null;
  /**
   * 巡检任务数
   */
  inspectTaskNum?: number | null;
  /**
   * 巡更任务数
   */
  patrolTaskNum?: number | null;
  /**
   * 预案文件数
   */
  planFileNum?: number | null;
  /**
   * 小散任务数
   */
  projectNum?: number | null;
  /**
   * 安全任务数
   */
  safetyTaskNum?: number | null;
}
export interface FilingResponse {
  name?: null | string;
  num?: number | null;
  ratio?: number | null;
}
