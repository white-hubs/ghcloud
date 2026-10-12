export interface AlarmInfo {
  /** 报警阈值 */
  thresholdValue: number | undefined;
  /** 报警开关 */
  enable: boolean | undefined;
  /** 报警级别 */
  levelId: number | undefined;
  name?: string | undefined;
}
export interface AlarmDetail {
  deviceName?: string;
  name?: string;
  genreName?: string;
}
export interface AlarmLevel {
  code: string;
  id: number;
  name: string;
  sort: number;
}

export interface ProductPropType {
  propCode: string;
  name: string;
  propUnit: string;
  dataType: string;
  precision: string;
  unitName: string;
  dataWrite: string;
  remark: string;
}
export interface ProductEventType {
  eventName: string;
  eventCode: string;
  categoryCode: string;
  categoryName: string;
  remark: string;
  eventConfig: unknown;
}
export interface PropType {
  key: string;
  val: string;
  unitName: string;
  name?: string;
  value?: string;
  ts: string | number;
}
export interface ConfigType {
  label: string;
  value: string;
}
export interface DeviceDetailType {
  deviceId: string;
  deviceParentId: string;
  deviceNumber: string;
  productId: string;
  productName: string;
  tags: string;
  onlineState: number;
  dataConstraint: ConfigType[];
  productPropVoList: ProductPropType[];
  productEventVoList: ProductEventType[];
  snapshots: PropType[];
}

/**
* 处理详情
*/
export interface Handler {
  alarmHandlerResult: string;
  alarmHandlerResultName: string;
  alarmHandlerResultRemark: string;
  createTime: string;
  createUserName: string;
  fileVOS: HandlerFileVO[];
}

export interface HandlerFileVO {
  businessKey?: string;
  id?: number;
  name?: string;
  path?: string;
  refCount?: number;
  size?: number;
  suffix?: string;
  type?: number;
}

export interface HandlerFileVOElement {
  businessKey: string;
  id: string;
  name: string;
  path: string;
  refCount: string;
  size: string;
  suffix: string;
  type: string;
}

/**
* 挂起详情
*/
export interface Suspend {
  createTime: string;
  createUserName: string;
  estimatedProcessTime: string;
  fileVOS: SuspendFileVO[];
  remark: string;
}

export interface SuspendFileVO {
  businessKey?: number;
  id?: number;
  name?: string;
  path?: string;
  refCount?: number;
  size?: number;
  suffix?: string;
  type?: string;
}

export interface IotDeviceProRecords {
  /**
   * 设备编号
   */
  deviceCode: string;
  /**
   * 设备类型主键
   */
  deviceGenreId: number;
  /**
   * 设备类型名称
   */
  deviceGenreName: string;
  /**
   * 设备主键
   */
  deviceId: number;
  /**
   * 设备型号主键
   */
  deviceModelId: number;
  /**
   * 设备型号名称
   */
  deviceModelName: string;
  /**
   * 设备名称
   */
  deviceName: string;
  /**
   * 事件主键
   */
  eventId: number;
  /**
   * 事件关联预案主键
   */
  eventLinkageId: number;
  /**
   * 执行方式
   */
  executeMode: ExecuteMode;
  /**
   * 执行状态
   */
  executeStatus: ExecuteStatus;
  /**
   * 执行描述
   */
  executeStatusDescribe: string;
  /**
   * 执行时间
   */
  executeTime: string;
  id: number;
  /**
   * 联动预案主键
   */
  linkageId: number;
  /**
   * 操作人
   */
  operatorBy: string;
  /**
   * 操作人名称
   */
  operatorName: string;
  /**
   * 操作时间
   */
  operatorTime: string;
  /**
   * 属性编号
   */
  propCode: string;
  /**
   * 属性名称
   */
  propName: string;
  /**
   * 属性值
   */
  propValue: string;
}

/**
* 执行状态
*/
export enum ExecuteStatus {
  EXPIRED = 'EXPIRED',
  FAIL = 'FAIL',
  ISSUE_SUCCESS = 'ISSUE_SUCCESS',
  SUCCESS = 'SUCCESS',
}

/**
* 执行方式
*/
export enum ExecuteMode {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
}
export interface VideoEventAction {
  /**
   * 设备编号
   */
  deviceCode: string;
  /**
   * 设备主键
   */
  deviceId: number;
  /**
   * 设备名称
   */
  deviceName: string;
  /**
   * 事件主键
   */
  eventId: number;
  /**
   * 事件联动主键
   */
  eventLinkageId: number;
  /**
   * 动作记录主键
   */
  eventVideoRecordId: number;
  /**
   * 执行时间
   */
  executeTime: string;
  /**
   * 外网文件路径
   */
  extranetFilePath: string;
  id: number;
  /**
   * 内网文件路径
   */
  intranetFilePath: string;
  /**
   * 联动主键
   */
  linkageId: number;
  /**
   * 摄像机token
   */
  token: string;
  /**
   * 动作类型
   */
  type: VideoType;
}

/**
* 动作类型
*/
export enum VideoType {
  PHOTOGRAPH = 'PHOTOGRAPH',
  VIDEOTAPE = 'VIDEOTAPE',
}

export interface IotDeviceListByEvent {
  /**
   * 设备编号
   */
  deviceCode: string;
  /**
   * 设备类型主键
   */
  deviceGenreId: number;
  /**
   * 设备类型名称
   */
  deviceGenreName: string;
  /**
   * 设备主键
   */
  deviceId: number;
  /**
   * 设备型号主键
   */
  deviceModelId: number;
  /**
   * 设备型号名称
   */
  deviceModelName: string;
  /**
   * 设备名称
   */
  deviceName: string;
  /**
   * 事件主键
   */
  eventId: number;
  /**
   * 事件关联预案主键
   */
  eventLinkageId: number;
  /**
   * 执行方式
   */
  executeMode: ExecuteMode;
  id: number;
  /**
   * 联动预案主键
   */
  linkageId: number;
  /**
   * 属性编号
   */
  propCode: string;
  /**
   * 属性名称
   */
  propName: string;
  /**
   * 属性值
   */
  propValue: string;
}

export interface AlarmRecordDetail {
  alarmConfirmedBy: number;
  alarmConfirmedName: string;
  alarmConfirmedTime: number;
  alarmEvent: string;
  alarmEventName: string;
  alarmHandlerBy: string;
  alarmHandlerName: string;
  alarmHandlerResult: string;
  alarmHandlerResultName: string;
  alarmHandlerResultRemark: string;
  alarmHandlerTime: string;
  alarmHandlerTimeoutStatus: string;
  alarmHandlerTimeoutStatusName: string;
  alarmLevelCode: string;
  alarmLevelId: string;
  alarmLevelName: string;
  alarmLevelSort: number;
  alarmNotifyUsername: string;
  alarmStatus: string;
  alarmStatusName: string;
  alarmTargetCode: string;
  alarmTargetKey: string;
  alarmTargetLongitude: string;
  alarmTargetName: string;
  alarmTargetTypeId: string;
  alarmTargetTypeName: string;
  alarmThreshold: string;
  alarmTime: number;
  alarmTypeCode: string;
  alarmTypeFileId: string;
  alarmTypeId: string;
  alarmTypeName: string;
  applicationCode: string;
  applicationName: string;
  area: string;
  areaName: string;
  businessKey: string;
  businessType: string;
  code: string;
  estimateHandlerTime: string;
  fileVO: string;
  handler: Handler;
  handlerFileVOS: HandlerFileVOElement[];
  id: string;
  snapshot: Record<string, unknown>;
  suspend: Suspend;
  timeoutProcessTime: string;
  timeoutProcessTimesName: string;
  timeoutProcessTimesUnit: string;
  url: string;
}
