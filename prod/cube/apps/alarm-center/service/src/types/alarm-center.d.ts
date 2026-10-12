export interface AlarmLevel {
  id: string;
  code: string;
  name: string;
  sort: number;
}

export interface AlarmType {
  id: string;
  code: string;
  name: string;
  sort: number;
  applicationCode: string;
  applicationName: string;
}
export interface FileVOState {
  businessKey?: string | null;
  id: string;
  name?: null | string;
  path: string;
  refCount?: number | null;
  size?: number | null;
  suffix?: null | string;
  type?: null | string;
}
export interface AlarmLevelPlayConfigVO {
  alarmLevelCode: string;
  file?: FileVOState;
  id: string;
  looped?: boolean;
  playNum?: number;
  followUpTime: string;
}
export interface AlarmFollowVo {
  id: string;
  alarmRecordId: string;
  content: string;
  followUpUserId: string;
  followUpUserName: string;
  followUpTime: string;
  files: FileVOState[];
}
export interface AlarmRecord {
  /**
   * 报警确认时间
   */
  alarmConfirmedBy: string;
  /**
   * 报警确认人员名称
   */
  alarmConfirmedName: string;
  /**
   * 报警确认结果
   */
  alarmConfirmedResult: string;
  /**
   * 报警确认结果名称
   */
  alarmConfirmedTime: string;
  /**
   * 可能是报警事件或者能耗异常类型（用于指定此次报警是什么引起的）
   */
  alarmEvent: string;
  /**
   * 报警事件名称
   */
  alarmEventName: string;
  /**
   * 应用主键
   */
  alarmHandlerBy: number;
  /**
   * 应用编号
   */
  alarmHandlerName: string;
  /**
   * 报警处理结果
   */
  alarmHandlerResult: 'ALARM_ACTUAL' | 'ALARM_IMPRACTICAL' | 'TIMED_OUT';
  /**
   * 报警处理结果
   */
  alarmHandlerResultName: string;
  /**
   * 报警处理结果描述
   */
  alarmHandlerResultRemark: string;
  /**
   * 应用名称
   */
  alarmHandlerTime: string;
  /**
   * 报警超时状态
   */
  alarmHandlerTimeoutStatus: 'NORMAL' | 'ALARM_IMPRACTICAL' | 'TIMED_OUT';
  /**
   * 级别编号
   */
  alarmLevelCode: string;
  /**
   * 级别主键
   */
  alarmLevelId: number;
  /**
   * 级别名称
   */
  alarmLevelName: string;
  /**
   * 级别序号
   */
  alarmLevelSort: number;
  /**
   * 报警状态
   */
  alarmStatus: string;
  /**
   * 报警状态名称
   */
  alarmStatusName: string;
  alarmTargetAddress: string;
  /**
   * 对象编号
   */
  alarmTargetCode: string;
  /**
   * 对象主键
   */
  alarmTargetKey: number;
  /**
   * 报警对象经纬度
   */
  alarmTargetLongitude: string;
  /**
   * 对象名称
   */
  alarmTargetName: string;
  /**
   * 对象类型主键
   */
  alarmTargetTypeId: number;
  /**
   * 对象类型主键
   */
  alarmTargetTypeName: string;
  /**
   * 报警阀值
   */
  alarmThreshold: string;
  /**
   * 报警发生时间
   */
  alarmTime: string;
  /**
   * 类型编号
   */
  alarmTypeCode: string;
  /**
   * 类型主键
   */
  alarmTypeId: number;
  /**
   * 类型名称
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
  /**
   * 报警区域
   */
  area: string;
  /**
   * 报警区域名称
   */
  areaName: string;
  /**
   * 业务主键
   */
  businessKey: number;
  /**
   * 业务类型
   */
  businessType: string;
  /**
   * 编号
   */
  code: string;
  /**
   * 预计处理时间
   */
  estimateHandlerTime: string;
  id: string;
  /**
   * 是否配备超时
   */
  timeoutEquipped: string;
  /**
   * 超时处理时间
   */
  timeoutProcessTime: string;
  /**
   * 超时处理时间
   */
  timeoutProcessTimes: string;
  /**
   * 超时处理时间名
   */
  timeoutProcessTimesName: string;
  /**
   * 超时处理时间单位
   */
  timeoutProcessTimesUnit: string;
  /**
   * 跳转地址
   */
  url: string;
  /**
   * 报警研判结果
   */
  assistConfirmResult: string;
}
export interface AlarmReason {
  id: string;
  code: string;
  initialized: boolean;
  reason: string;
  remark: string;
}

export interface HandleAnalysis {
  alarmHandlerTotalNum: number;
  alarmUnresolvedHandlerTotalNum: number;
  alarmHandlerTopThreeUserNames: string;
  topTenUserHandlerStatisticsVOS:
  {
    id: string;
    name: string;
    alarmHandlerTotalNum: number;
    alarmUnresolvedHandlerTotalNum: number;
  }[]
  ;
  lastTopTenUserHandlerStatisticsVOS:
  {
    id: string;
    name: string;
    alarmHandlerTotalNum: number;
    alarmUnresolvedHandlerTotalNum: number;
  }[];
}
export interface AlarmStatisticsTrend {
  /**
   * 报警数量
   */
  alarmNum: string;
  /**
   * 已处理报警数量
   */
  handlerNum: string;
  /**
   * 时间
   */
  period: string;
}
export interface AlarmStatisticsTypeRank {
  /**
   * 报警数量
   */
  alarmNum: number;
  /**
   * 报警类型主键
   */
  id: number;
  /**
   * 报警类型名称
   */
  name: string;
}

export interface AlarmStatisticsVO {
  /**
   * 报警处理数量
   */
  alarmHandlerNum: string;
  /**
   * 报警数量
   */
  alarmNum: string;
  /**
   * 报警处理结果统计
   */
  alarmResultStatisticsVOS: AlarmResultStatisticsVO[];
  /**
   * 报警处理状态统计
   */
  alarmStatusStatisticsVOS: AlarmStatusStatisticsVO[];
}

export interface AlarmResultStatisticsVO {
  /**
   * 处理结果
   */
  alarmHandlerResult: string;
  /**
   * 处理结果名称
   */
  alarmHandlerResultName: string;
  /**
   * 数量
   */
  alarmNum: number;
}

export interface AlarmStatusStatisticsVO {
  /**
   * 数量
   */
  alarmNum: number;
  /**
   * 处理状态
   */
  alarmStatus: string;
  /**
   * 处理状态名称
   */
  alarmStatusName: string;
}

