import type { AlarmFollowVo } from "./types/alarm-center";
export interface PageResult<T> {
  pages: number;
  records: T[];
  total: number;
}

export interface AlarmDetails {
  id: string;
  code: string;
  alarmLevelId: string;
  alarmLevelCode: string;
  alarmLevelName: string;
  alarmNotifyUsers: {
    id: string;
    userId: string;
    userName: string;
  }[];
  followUps: AlarmFollowVo[];
  alarmLevelSort: number;
  alarmTypeId: string;
  alarmTypeCode: string;
  alarmTypeName: string;
  alarmTypeFileId?: unknown;
  alarmTargetKey: string;
  alarmTargetCode: string;
  alarmTargetName: string;
  alarmTargetTypeId: string;
  alarmTargetTypeName: string;
  alarmTargetLongitude: string;
  alarmTargetAddress: string;
  businessType: string;
  businessKey: string;
  alarmTime: number;
  area: string;
  areaName: string;
  alarmThreshold: string;
  alarmEvent: string;
  alarmEventName: string;
  alarmStatus: string;
  alarmStatusName: string;
  alarmConfirmedBy: string;
  alarmConfirmedName: string;
  alarmConfirmedTime: number;
  estimateHandlerTime?: number;
  alarmHandlerBy: string;
  alarmHandlerName: string;
  alarmHandlerTime?: number;
  alarmHandlerResult?: unknown;
  alarmNotifyUsername: string;
  alarmHandlerResultName: string;
  alarmHandlerResultRemark: string;
  timeoutProcessTime?: number;
  timeoutProcessTimes: number;
  timeoutProcessTimesUnit: string;
  timeoutProcessTimesName: string;
  alarmHandlerTimeoutStatus: string;
  alarmHandlerTimeoutStatusName: string;
  applicationId?: string;
  applicationCode: string;
  applicationName: string;
  snapshot: string;
  alarmSnapshot: string;
  fileVO?: unknown[];
  handlerFileVOS: unknown[];
  url: string;
  suspend?: Suspend | null;
  handler?: Handler | null;
  processingTime: number;
  alarmOperator: unknown[];
  assistConfirmResult: string;
}
interface FileVO {
  id: string;
  name: string;
  suffix: string;
  path: string;
  size: number;
  refCount: number;
  type: string;
  businessKey?: string;
}
export interface Suspend {
  estimatedProcessTime: number;
  remark: string;
  fileVOS: FileVO[];
  userId: string;
  createTime: number;
  createUserName: string;
}
export interface Handler {
  alarmHandlerResult: string;
  alarmHandlerResultName: string;
  alarmHandlerResultRemark: string;
  fileVOS: FileVO[];
  recordHandlerReason: {
    id: string;
    alarmRecordId: string;
    alarmReasonId: string;
    alarmReasonCode: string;
    alarmReason: string;
    alarmReasonRemark: string;
  };
  createTime: number;
  userId: string;
  createUserName: string;
}
export interface MediaState {
  id: string;
  eventVideoRecordId: string;
  eventLinkageId: string;
  eventId: string;
  linkageId: string;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  token: string;
  executeTime: number;
  type: string;
  extranetFilePath: string;
  intranetFilePath: string;
}
export interface LinkageDevice {
  id: string;
  eventLinkageId: number;
  eventId: number;
  linkageId: number;
  deviceGenreId: number;
  deviceGenreName: string;
  deviceModelId: number;
  deviceModelName: string;
  deviceId: number;
  deviceCode: string;
  deviceName: string;
  propCode: string;
  propName: string;
  propValue: string;
  translatedValue: string;
  executeMode: string;
}
export interface LinkageExecuteRecord {
  id: number;
  eventLinkageId: number;
  eventId: number;
  linkageId: number;
  deviceGenreId: number;
  deviceGenreName: string;
  deviceModelId: number;
  deviceModelName: string;
  deviceId: number;
  deviceCode: string;
  deviceName: string;
  propCode: string;
  propName: string;
  executeMode: string;
  executeStatus: string;
  executeStatusDescribe: string;
  executeTime: string;
  propValue: string;
  translatedValue: string;
  operatorBy: string;
  operatorName: string;
  operatorTime: string;
}
export interface OperatorRecord {
  id: string;
  alarmRecordId: string;
  operatorType: string;
  operatorBy: string;
  operatorByName: string;
  operatorTime: number;
  operatorContent: string;
  remark: string;
}
export interface DataConstraint {
  label: string;
  value: string;
}
export interface ProductPropVoList {
  propCode: string;
  propName: string;
  dataType: string;
  precision: number;
  unitName: string;
  dataWrite: number;
  dataConstraint: number[] | DataConstraint[];
  isTelemetry?: unknown;
  remark: string;
}

export interface Snapshot {
  key: string;
  value: string;
  preValue: string;
  changed: boolean;
  ts: number;
}

export interface IotDeviceProps {
  deviceId: string;
  deviceParentId: string;
  deviceNumber: string;
  productId: string;
  productName: string;
  deviceName: string;
  onlineState: number;
  tags: string;
  productPropVoList: ProductPropVoList[];
  productEventVoList: unknown[];
  snapshots: Snapshot[];
  productCommandVoList: unknown[];
}
export interface Statu {
  onlineState: boolean;
  communicationTime?: number;
}

export interface Department {
  id: string;
  name: string;
}

export interface Area {
  id: string;
  name: string;
  pathName: string;
  pathId: string;
}

export interface Manager {
  id: string;
  name: string;
}

export interface BaseArchivesInfo {
  id: string;
  name: string;
  code: string;
  status: Statu;
  department: Department;
  area: Area;
  manager: Manager[];
  thirdPartyId: string;
  thirdpartyCfg: string;
  picture: string;
}

export interface PurchaseInfo {
  unitPrice: string;
  purchaseDate: number;
}

export interface FactoryInfo {
  productionDate: number;
  usefulLife: number;
}

export interface ExpandInfo {
  id: string;
  lntAndLat: string;
  locationDes: string;
  purchaseInfo: PurchaseInfo;
  factoryInfo: FactoryInfo;
}

export interface ProductCategory {
  name: string;
  code: string;
  pathCode: string;
}

export interface ProductInfo {
  id: string;
  name: string;
  picture?: string;
  icon?: string;
  modelName: string;
  brandName: string;
  productCategory: ProductCategory;
}

export interface DeviceDetails {
  baseArchivesInfo: BaseArchivesInfo;
  expandInfo: ExpandInfo;
  productInfo: ProductInfo;
}

/**
 * 按用户分组统计报警状态的分页返回参数
 *
 * AlarmStatusTotalPageVO
 */
export interface AlarmStatusTotalPageVO {
  /**
   * 报警事件类型
   */
  alarmEventName?: null | string;
  /**
   * 报警总数
   */
  alarmTotalNum?: number | null;
  /**
   * 平均处理耗时
   */
  averageProcessing?: null | string;
  /**
   * 报警响应率
   */
  confirmedRate?: null | string;
  /**
   * 部门主键
   */
  departmentId?: number | null;
  /**
   * 部门名称
   */
  departmentName?: null | string;
  /**
   * 部门报警数
   */
  departmentTotalNum?: number | null;
  /**
   * 已处理报警数
   */
  handlerNum?: number | null;
  /**
   * 处理完成率
   */
  handlerRate?: null | string;
  /**
   * 处理耗时(分钟)
   */
  processingTime?: number | null;
  /**
   * 处理中报警数
   */
  progressConfirmedNum?: number | null;
  /**
   * 报警占比
   */
  ratio?: null | string;
  /**
   * 已挂起报警数
   */
  suspendNum?: number | null;
  /**
   * 超时数量
   */
  timeoutNum?: number | null;
  /**
   * 报警超时率
   */
  timeoutRate?: null | string;
  /**
   * 负责的报警数
   */
  totalNum?: number | null;
  /**
   * 未响应报警数
   */
  unconfirmedNum?: number | null;
  /**
   * 用户主键
   */
  userId?: number | null;
  /**
   * 用户名称
   */
  userName?: null | string;
}
export interface EfficiencyTenAnalysis {
  alarmHandlerBy: string;
  alarmHandlerName: string;
  alarmLevelId: number;
  alarmLevelCode: string;
  alarmLevelSort: string;
  alarmLevelName: string;
  avgProcessMinutes: number;
  avgProcessSeconds: number;
  averageProcessing: string;
}
export interface AlarmAnalysisLevel {
  id: string;
  name: string;
  alarmNum: number;
  ratio: string;
}
export interface EventAnalysis {
  alarmTopThreeEventNames: string;
  alarmTopEventName: string;
  alarmTopNum: number;
  alarmCurrencyStatisticsVOS: [
    {
      id: string;
      name: string;
      totalNum: number;
      ratio: string;
    },
  ];
}
export interface TrendAnalysis {
  topTimeSlot: string;
  alarmTrendStatisticsVOS: {
    alarmNum: number;
    handlerNum: number;
    period: string;
  }[];
}
export interface AreaAnalysis {
  alarmTopThreeAreaNames: string;
  alarmTopAreaName: string;
  alarmTopNum: number;
  alarmCurrencyStatisticsVOS: {
    id: string;
    name: string;
    totalNum: number;
    ratio: string;
  }[];
}
export interface LevelHandlerEfficiencyAnalysis {
  id: number;
  code: string;
  name: string;
  sort: number;
  highEfficiencyUserName: string;
  lowEfficiencyUserName: string;
}
export interface AlarmEventStatisticsType {
  id: string;
  name: string;
  totalNum: number;
  handlerNum: number;
  processingTime: number;
}
export interface AlarmNearbyDevice {
  area: { pathName: string };
  code: string;
  id: string;
  name: string;
  productInfo: {
    brandName: string;
    name: string;
    productCategory: {
      code: string;
      name: string;
    };
  };
  status: {
    onlineState: boolean;
  };
}
export interface AlarmApplicationStatGroup {
  /**
   * 报警数量
   */
  alarmNum: number;
  /**
   * 应用编号
   */
  applicationCode: string;
  /**
   * 应用名称
   */
  applicationName: string;
}
export interface AlarmStaticDTO {
  alarmNum: number;
  alarmStatus: string;
  alarmStatusName: string;
  chainRatio: number;
  ratio: number;
}

export interface AlarmEventRecord {
  id: string;
  code: string;
  name: string;
  eventId: string;
  eventTime: string;
  eventDevice: {
    id: string;
    code: string;
    name: string;
    areaName: string;
    lntAndLat: string;
    address: string;
  };
  eventLevel: {
    id: string;
    code: string;
    name: string;
  };
  eventSnapshot: {
    snapshot: string;
  };
  eventApp: {
    code: string;
    name: string;
  };
  eventType: {
    id: string;
    code: string;
    name: string;
  };
  assistConfirmResult: {
    result: string;
  };
}
