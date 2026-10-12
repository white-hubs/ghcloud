export type TimeType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR'

export interface SafetyAnalysisAlarmTotal {
  /**
   * 安全报警数
   */
  alarmNum?: number | null;
  /**
   * 已处理报警数
   */
  handlerNum?: number | null;
  /**
   * 用气安全-易燃设备建档数
   */
  inflammableDeviceNum?: number | null;
  /**
   * 未处理报警数
   */
  noHandlerNum?: number | null;
  ringAlarmNumRatio?: number | null;
  ringHandlerNumRatio?: number | null;
  ringNoHandlerRatio?: number | null;
  inflammableDeviceNumRatio?: number | null;
}
export interface SafetyAnalysisAlarmRatio {
  name: string;
  typeName: string;
  /**
   * 当前类型的报警数
   */
  alarmNum?: number | null;
  /**
   * 总数
   */
  alarmTotalNum?: number | null;
  /**
   * 占比
   */
  ratio?: number | null;
  /**
   * 类型
   */
  typeCode?: null | string;
}
export interface SafetyAnalysisAlarmHandlerRank {
  /**
   * 处理率
   */
  handlerRatio?: number | null;
  /**
   * 处理数
   */
  handlerRingRatio?: number | null;
  /**
   * 响应率
   */
  respondedRatio?: number | null;
  /**
   * 响应数
   */
  respondedRingRatio?: number | null;
  /**
   * 超时率
   */
  timeOutRatio?: number | null;
  /**
   * 超时数
   */
  timeOutRingRatio?: number | null;
  /**
   * 处理率排名
   */
  userhandlerRatioRankList?: AlarmUserRatioVO[] | null;
  /**
   * 响应率排名
   */
  userResponedRatioRankList?: AlarmUserRatioVO[] | null;
  /**
   * 超时率排名
   */
  usertimeOutRatioRankList?: AlarmUserRatioVO[] | null;
}

export interface AlarmUserRatioVO {
  ratio?: number | null;
  userName?: null | string;
}
export interface DeviceStatsNumVO {
  /**
    * 设备总数
    */
  deviceNum?: number | null;
  /**
    * 到期数
    */
  expireNumber?: number | null;
  /**
    * 在线数
    */
  normalNumber?: number | null;
  /**
    * 离线数
    */
  offlineNumber?: number | null;
  /**
    * 建档数
    */
  putOnRecordNumber?: number | null;
}
export interface AlarmCorrectRatioVO2 {
  /**
    * 真实报警数
    */
  alarmActualNum?: number | null;
  /**
    * 当前类型的报警数
    */
  alarmNum?: number | null;
  /**
    * 真实报警率
    */
  correctRate?: number | null;
  /**
    * 已处理报警数
    */
  handlerNum?: number | null;
  /**
    * 类型
    */
  typeCode?: null | string;
}
export interface AlarmTypeStatisticsVO {
  /**
   * 报警数量
   */
  alarmNum?: number | null;
  /**
   * 报警类型主键
   */
  id?: null | string;
  /**
   * 报警类型名称
   */
  name?: null | string;
  applicationCode?: string;
}

export interface AlarmStatisticsVO {
  /**
   * 报警处理数量
   */
  alarmHandlerNum?: number | null;
  /**
   * 报警数量
   */
  alarmNum?: number | null;
  /**
   * 报警环比
   */
  alarmRingRatio?: string | number | null;
  /**
   * 报警处理结果统计
   */
  alarmResultStatisticsVOS?: AlarmResultStatisticsVO[] | null;
  /**
   * 报警处理状态统计
   */
  alarmStatusStatisticsVOS?: AlarmStatusStatisticsVO[] | null;
}

/**
* 报警处理结果统计返回参数
*/
export interface AlarmResultStatisticsVO {
  /**
   * 处理结果
   */
  alarmHandlerResult?: AlarmHandlerResult;
  /**
   * 处理结果名称
   */
  alarmHandlerResultName?: null | string;
  /**
   * 数量
   */
  alarmNum?: number | null;
}

/**
* 处理结果
*/
export enum AlarmHandlerResult {
  ALARM_ACTUAL = 'ALARM_ACTUAL',
  ALARM_IMPRACTICAL = 'ALARM_IMPRACTICAL',
}

/**
* 报警处理状态统计
*/
export interface AlarmStatusStatisticsVO {
  /**
   * 数量
   */
  alarmNum?: number | null;
  /**
   * 处理状态
   */
  alarmStatus?: string;
  /**
   * 处理状态名称
   */
  alarmStatusName?: null | string;
  /**
   * 环比
   */
  chainRatio?: number | null;
  /**
   * 占比
   */
  ratio?: number | null;
}
export interface SafetyAnalysisAlarmVO1 {
  /**
   * 各应用报警数和占比
   */
  applicationAlarmDataList?: AlarmLevelRatioCardVO[] | null;
  /**
   * 小散工程数
   */
  looseWorkNum?: number | null;
  /**
   * 风险源建档数
   */
  riskSourceNum?: number | null;
  /**
   * 安全任务报警数
   */
  safetyAlarmNum?: number | null;
}

export interface AlarmLevelRatioCardVO {
  /**
   * 当前类型的报警数
   */
  alarmNum?: number | null;
  /**
   * 总数
   */
  alarmTotalNum?: number | null;
  /**
   * 占比
   */
  Ratio?: number | null;
  ratio?: number | null;
  /**
   * 类型
   */
  typeCode?: null | string;
}
export interface AlarmTrendStatisticsVO {
  /**
     * 报警数量
     */
  alarmNum?: number | null;
  /**
     * 已处理报警数量
     */
  handlerNum?: number | null;
  /**
     * 时间
     */
  period?: null | string;
}
export interface SafetyAnalysisAlarmVO3 {
  /**
   * 报警任务响应率统计
   */
  alarmDispose?: WorkSituationVO;
  /**
   * 安全教育频率
   */
  educationFrequency?: WorkSituationVO;
  /**
   * 安全预案制度
   */
  emergencyFile?: WorkSituationVO;
  /**
   * 隐患处理率统计
   */
  hiddenDangerDispose?: WorkSituationVO;
  /**
   * 安全巡检频率
   */
  inspectFrequency?: WorkSituationVO;
  /**
   * 安全巡更频率
   */
  patrolFrequency?: WorkSituationVO;
  /**
   * 小散工程异常率
   */
  projectError?: WorkSituationVO;
}

export interface WorkSituationVO {
  chainRatio?: number | null;
  ratio?: number | null;
  totalNum?: number | null;
}
export interface ProjectDataForAnalysisVO2 {
  /**
   * 异常数
   */
  abnormal?: number | null;
  /**
   * 异常数环比
   */
  abnormalRingRatio?: number | null;
  /**
   * 总数
   */
  total?: number | null;
  /**
   * 总数环比
   */
  totalRingRatio?: number | null;
  /**
   * 进行中的个数
   */
  underway?: number | null;
  /**
   * 进行中的环比
   */
  underwayRingRatio?: number | null;
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
  /**
   * 时间
   */
  period?: null | string;
}

export interface RiskIndexDetail {
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
  propertyCategoryDetails: PropertyCategoryDetail[];
  /**
   * 风险源建档得分
   */
  riskIndex: number;
}

export interface PropertyCategoryDetail {
  /**
   * 类型编码
   */
  propertyCategory: PropertyCategory;
  /**
   * 类型得分
   */
  riskIndex: number;
}

/**
* 类型编码
*/
export enum PropertyCategory {
  ELECTRIC_VEHICLE = 'ELECTRIC_VEHICLE',
  FIRE_FIGHTING_EQUIPMENT = 'FIRE_FIGHTING_EQUIPMENT',
  FLAMMABLE_EQUIPMENT = 'FLAMMABLE_EQUIPMENT',
}
export interface HiddenDangerTypeStatisticsVO {
  /**
   * 隐患单总数
   */
  totalNum?: number | null;
  /**
   * 隐患分类统计
   */
  typeStatisticsList?: HiddenDangerTypeStatistics[] | null;
}

/**
* HiddenDangerTypeStatistics
*/
export interface HiddenDangerTypeStatistics {
  /**
   * 分类名称
   */
  name?: null | string;
  /**
   * 分类数量
   */
  num?: number | null;
  /**
   * 占比
   */
  proportion?: number | null;
}
