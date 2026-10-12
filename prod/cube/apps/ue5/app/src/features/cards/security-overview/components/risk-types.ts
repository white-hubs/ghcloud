export interface RiskDetail {
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
  [property: string]: any;
}

/**
 * 报警情况
 */
interface AlarmSituationRiskIndex {
  /**
   * 级别得分情况
   */
  alarmLevelIndexDetails: AlarmSituationRiskIndexAlarmLevelIndexDetail[];
  /**
   * 报警情况得分
   */
  riskIndex: number;
  [property: string]: any;
}

interface AlarmSituationRiskIndexAlarmLevelIndexDetail {
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
  [property: string]: any;
}

/**
 * 报警级别编号
 */
enum AlarmLevel {
  OneLevel = "ONE_LEVEL",
  ThreeLevelAndFourLevel = "THREE_LEVEL_AND_FOUR_LEVEL",
  TwoLevel = "TWO_LEVEL",
}

/**
 * 报警未响应情况
 */
interface AlarmUnConfirmedRiskIndex {
  /**
   * 级别得分情况
   */
  alarmLevelIndexDetails: AlarmUnConfirmedRiskIndexAlarmLevelIndexDetail[];
  /**
   * 报警情况得分
   */
  riskIndex: number;
  [property: string]: any;
}

interface AlarmUnConfirmedRiskIndexAlarmLevelIndexDetail {
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
  [property: string]: any;
}

/**
 * 隐患情况
 */
interface HiddenDangerRiskIndex {
  /**
   * 隐患情况得分
   */
  riskIndex: number;
  /**
   * 隐患数量
   */
  totalNum: number;
  [property: string]: any;
}

/**
 * 隐患未响应情况
 */
interface HiddenDangerUnConfirmedRiskIndex {
  /**
   * 隐患未响应得分
   */
  riskIndex: number;
  /**
   * 隐患数量
   */
  totalNum: number;
  [property: string]: any;
}

/**
 * 风险源建档情况
 */
interface PropertyFilingRiskIndex {
  /**
   * 建档类型得分明细
   */
  propertyCategoryDetails: PropertyCategoryDetail[];
  /**
   * 风险源建档得分
   */
  riskIndex: number;
  [property: string]: any;
}

interface PropertyCategoryDetail {
  /**
   * 类型编码
   */
  propertyCategory: PropertyCategory;
  /**
   * 类型得分
   */
  riskIndex: number;
  [property: string]: any;
}

/**
 * 类型编码
 */
enum PropertyCategory {
  ElectricVehicle = "ELECTRIC_VEHICLE",
  FireFightingEquipment = "FIRE_FIGHTING_EQUIPMENT",
  FlammableEquipment = "FLAMMABLE_EQUIPMENT",
}
