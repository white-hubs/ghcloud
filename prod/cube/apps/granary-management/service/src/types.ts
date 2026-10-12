export interface HealthStatus {
  ok: boolean;
}

/**
 * GET `/liangcang/warehouse-management/warehouse/list` 单条
 * 对齐后端 {@code LiangcangWarehouseListItemVO}：智慧仓库行 + 雷达设备字段
 */
export interface LiangcangWarehouseListItem {
  warehouseId: number;
  warehouseName: string;
  categoryName: string;
  qualityGrade: string;
  warehouseHeight: number | null;
  totalVolume: number | null;
  radarDeviceId: number;
  sn: string;
  type: string;
  status: string;
}

/** @deprecated 使用 {@link LiangcangWarehouseListItem} */
export type LiangcangWarehouseRadarItem = LiangcangWarehouseListItem;

/**
 * POST `/liangcang/warehouse-management/bind` 请求体（Apifox：雷达设备绑定；对齐 RadarDeviceBindParam）
 * `deviceIds` 使用字符串数组：业务设备 id 常为 int64，在 JSON/JS 中若以 number 传输会超出安全整数范围导致精度丢失。
 * `selectAllDevices` 为 true 时，后端按 `productIds`、`areaIds`、`deviceName` 绑定全部**可关联**业务设备（与解绑接口同名字段「按筛选全选已绑定设备」不同）。
 * 产品/区域 id 以字符串传输，避免 JS number 丢失 int64 精度。
 */
export interface LiangcangWarehouseRadarBindPayload {
  warehouseId: number;
  radarDeviceId: number;
  deviceIds: string[];
  selectAllDevices?: boolean;
  productIds?: string[];
  areaIds?: string[];
  deviceName?: string;
}

/**
 * POST `/liangcang/warehouse-management/unbind` 请求体（粮仓业务设备解绑；对齐 WarehouseUnbindParam）
 * `selectAllDevices` 为 true 时按 `productIds`、`areaIds`、`deviceName` 解绑当前查询下全部**已绑定**业务设备（与绑定接口中「按筛选全选可关联设备」语义不同）。
 * `deviceIds` 使用字符串数组，避免 int64 精度问题。
 */
export interface LiangcangWarehouseUnbindPayload {
  warehouseId: number;
  deviceIds?: string[];
  selectAllDevices?: boolean;
  productIds?: string[];
  areaIds?: string[];
  deviceName?: string;
}

/**
 * GET `/liangcang/warehouse-management/bound-warehouse/list` 单项（Apifox：`BoundWarehouseSimpleVO`）
 */
export interface LiangcangBoundWarehouseSimpleItem {
  warehouseId: number;
  /** 粮仓名称 */
  name: string;
  /** 粮仓类型（智慧仓库 categoryName） */
  type: string;
}

/**
 * GET `/liangcang/warehouse-management/warehouse-info/page` 分页项（对齐 RadarBoundPageVO）
 */
export interface LiangcangBoundWarehousePageItem {
  warehouseId: number;
  radarDeviceId: number;
  granaryName: string;
  category: string;
  level: string;
  maxHeight: number | null;
  granaryVolume: number | null;
  /** 绑定状态：已创建 / 未创建（与 `bindingStatus` 查询参数对应） */
  bindingStatus?: string;
  /** 已关联业务设备数；未创建绑定时为 0 */
  relatedDeviceCount?: number;
  /** 已绑定产品类型，顿号分隔 */
  boundProductTypes?: string;
  /** 是否允许复制大屏链接；为 `false` 时不展示复制按钮；未返回时按允许处理 */
  copyAllowed?: boolean;
}

/**
 * GET `/liangcang/warehouse-management/detail` 响应（对齐 RadarBindingDetailVO）
 */
export interface LiangcangRadarBindingDetailDeviceItem {
  deviceId: number;
  deviceSn: string;
  deviceType: string;
  deviceName: string;
}

export interface LiangcangRadarBindingDetailVO {
  warehouseId: number;
  radarDeviceId: number | null;
  granaryName: string;
  category: string;
  level: string;
  maxHeight: number | null;
  granaryVolume: number | null;
  devices: LiangcangRadarBindingDetailDeviceItem[];
}

/**
 * GET `/liangcang/warehouse-management/bound-devices/page` 分页项
 */
export interface LiangcangBoundWarehouseDevicePageItem {
  deviceId: string;
  deviceSn: string;
  deviceType: string;
  deviceName: string;
  productName?: string;
  areaName?: string;
  area?: {
    name?: string;
    pathName?: string;
  };
}

export interface LiangcangDeviceStatusCountVO {
  total: number | null;
  online: number | null;
  offline: number | null;
}

export interface LiangcangRadarMonitoringSummaryVO {
  totalDeviceCount: number;
  onlineDeviceCount: number;
  offlineDeviceCount: number;
  alarmWarehouseCount: number;
  alarmCount: number;
}

/**
 * GET `/liangcang/warehouse-management/radar-monitoring/dashboard` 仓房监测卡片。
 * ID 使用字符串承载，避免 JavaScript 处理 int64 时发生精度丢失。
 */
export interface LiangcangRadarMonitoringWarehouseVO {
  warehouseId: string;
  warehouseName: string;
  currentWeight: number | null;
  currentVolume: number | null;
  weightWarningValue: number | null;
  volumeWarningValue: number | null;
  online: boolean | null;
  latestReportTime: string;
  alarm: boolean;
  alarmMessage: string;
}

export interface LiangcangRadarMonitoringAlarmVO {
  id: string;
  content: string;
  level: string;
  warehouseName: string;
  warehouseId: string;
  alarmArea: string;
  alarmTime: string;
}

export interface LiangcangRadarMonitoringDashboardVO {
  summary: LiangcangRadarMonitoringSummaryVO;
  warehouses: LiangcangRadarMonitoringWarehouseVO[];
  recentAlarms: LiangcangRadarMonitoringAlarmVO[];
}

export interface LiangcangGasMonitoringSummaryVO {
  totalDeviceCount: number;
  onlineDeviceCount: number;
  offlineDeviceCount: number;
  alarmWarehouseCount: number;
  alarmCount: number;
}

export interface LiangcangGasMonitoringWarehouseVO {
  warehouseId: string;
  warehouseName: string;
  co2: number | null;
  o2: number | null;
  ph3: number | null;
  online: boolean | null;
  alarm: boolean;
  alarmMessage: string;
}

export interface LiangcangGasMonitoringAlarmVO extends LiangcangRadarMonitoringAlarmVO {}

export interface LiangcangGasMonitoringDashboardVO {
  summary: LiangcangGasMonitoringSummaryVO;
  warehouses: LiangcangGasMonitoringWarehouseVO[];
  recentAlarms: LiangcangGasMonitoringAlarmVO[];
}

export interface LiangcangTemperatureHumidityMonitoringSummaryVO {
  totalDeviceCount: number;
  onlineDeviceCount: number;
  offlineDeviceCount: number;
  warningWarehouseCount: number;
  alarmWarehouseCount: number;
  alarmCount: number;
  warningCount: number;
}

export interface LiangcangTemperatureHumidityMonitoringWarehouseVO {
  warehouseId: string;
  warehouseName: string;
  onlineDeviceCount: number;
  offlineDeviceCount: number;
  online: boolean | null;
  maxTemperature: number | null;
  minTemperature: number | null;
  avgTemperature: number | null;
  humidity: number | null;
  alarm: boolean;
  warning: boolean;
}

export interface LiangcangTemperatureHumidityMonitoringAlarmVO extends LiangcangRadarMonitoringAlarmVO {}

export interface LiangcangTemperatureHumidityMonitoringWarningVO {
  id: string;
  warehouseId: string;
  warehouseName: string;
  content: string;
  currentAvgTemperature: number | null;
  warningThreshold: number | null;
  distanceToThreshold: number | null;
  dailyIncrease: number | null;
  consecutiveDays: number | null;
  triggeredAt: string;
  status: string;
}

export interface LiangcangTemperatureHumidityMonitoringAlertVO {
  recentAlarms: LiangcangTemperatureHumidityMonitoringAlarmVO[];
  recentTemperatureWarnings: LiangcangTemperatureHumidityMonitoringWarningVO[];
}

export interface LiangcangTemperatureHumidityMonitoringDashboardVO {
  summary: LiangcangTemperatureHumidityMonitoringSummaryVO;
  warehouses: LiangcangTemperatureHumidityMonitoringWarehouseVO[];
  recentAlarms: LiangcangTemperatureHumidityMonitoringAlarmVO[];
  recentTemperatureWarnings: LiangcangTemperatureHumidityMonitoringWarningVO[];
}

/**
 * GET `/liangcang/warehouse-management/location-card/info`，Query：`warehouseId`
 * 粮仓位置卡片聚合数据（Apifox 文档若未同步导出，解析器对扁平字段、嵌套对象与遥测数组做兼容）。
 */
export interface LiangcangWarehouseLocationCardInfoVO {
  warehouseId: number;
  granaryName: string;
  category: string;
  level: string;
  maxHeight: number | null;
  height: number | null;
  length: number | null;
  width: number | null;
  granaryVolume: number | null;
  temperatureRangeMin: number | null;
  temperatureRangeMax: number | null;
  tempMax: number | null;
  tempMin: number | null;
  tempAvg: number | null;
  tempInternal: number | null;
  tempExternal: number | null;
  materialVolume: number | null;
  digitalGrainVolume: number | null;
  deductedVolume: number | null;
  storageBagCount: number | null;
  averageBagWeight: number | null;
  materialWeight: number | null;
  remainingVolume: number | null;
  /** 使用率（%），由接口小数比例 ×100 得到 */
  usageRate: number | null;
  /** 温湿度传感设备是否在线；未知时为 null */
  tempHumidityDeviceOnline: boolean | null;
  /** 储量监测雷达是否在线；未知时为 null */
  radarOnline: boolean | null;
  /** 气体检测是否在线；未知时为 null */
  gasOnline: boolean | null;
  radarDeviceStatus: LiangcangDeviceStatusCountVO;
  temperatureDeviceStatus: LiangcangDeviceStatusCountVO;
  gasDeviceStatus: LiangcangDeviceStatusCountVO;
  gasCo: number | null;
  gasCo2: number | null;
  gasNo: number | null;
  gasO2: number | null;
  gasPh3: number | null;
  gasSo2f2: number | null;
  humidity: number | null;
  positionCode: string;
  keeper: string;
  filingDate: string;
  authorizedUnit: string;
  storageSite: string;
  inboundTime: string;
  originPlace: string;
  storageNature: string;
  harvestYear: string;
  storageMode: string;
  constantTemperatureRate: number | null;
  bulkDensityOrRoughness: number | null;
  convertedMoisture: number | null;
  wholeOrImperfectGrain: number | null;
  qualityInspections: WarehouseLocationCardQualityInspectionVO[];
  configDetail?: WarehouseLocationCardConfigDetailVO | null;
}

/**
 * POST `/liangcang/warehouse-location-card/bound-warehouse/page` 分页项。
 */
export interface WarehouseLocationCardBoundWarehousePageItem {
  warehouseId: number;
  warehouseName: string;
  categoryName: string;
  qualityGrade: string;
  maxHeight: number | null;
  warehouseVolume: number | null;
  keeper: string;
}

export interface WarehouseLocationCardBoundWarehousePageParam {
  pageNumber: number;
  pageSize: number;
  warehouseName?: string;
}

export interface WarehouseLocationCardPositionProfileVO {
  warehouseId: number;
  positionNo: string;
  positionCode: string;
  flatWarehouseNo: string;
  height: number | null;
  width: number | null;
  length: number | null;
  temperatureRangeMin: number | null;
  temperatureRangeMax: number | null;
  digitalGrainVolume: number | null;
  deductedVolume: number | null;
  storageBagCount: number | null;
  averageBagWeight: number | null;
  originPlace: string;
  harvestYear: string;
  materialVolume: number | null;
  remainingVolume: number | null;
  weight: number | null;
  keeper: string;
  filingDate: string;
  authorizedUnit: string;
  storageSite: string;
  inboundTime: string;
  storageNature: string;
  storageMode: string;
  constantTemperatureRate: number | null;
  bulkDensityOrRoughness: number | null;
  convertedMoisture: number | null;
  wholeOrImperfectGrain: number | null;
}

export interface WarehouseLocationCardPositionProfileSaveParam {
  warehouseId: number;
  positionCode: string;
  flatWarehouseNo: string;
  height: number | null;
  width: number | null;
  length: number | null;
  temperatureRangeMin: number | null;
  temperatureRangeMax: number | null;
  digitalGrainVolume: number | null;
  deductedVolume: number | null;
  storageBagCount: number | null;
  averageBagWeight: number | null;
  originPlace: string;
  harvestYear: string;
  keeper: string;
  filingDate: string;
  authorizedUnit: string;
  storageSite: string;
  inboundTime: string;
  storageNature: string;
  storageMode: string;
  constantTemperatureRate: number | null;
  bulkDensityOrRoughness: number | null;
  convertedMoisture: number | null;
  wholeOrImperfectGrain: number | null;
}

export interface WarehouseLocationCardQualityInspectionVO {
  id: number | string;
  inspectionTime: string | number;
  inspector: string;
  moisture: number | null;
  impurity: number | null;
  mixedRate: number | null;
  headRiceRate: number | null;
  outOfPaddyBrownRiceRate: number | null;
  yellowRiceRate: number | null;
  tasteScore: number | null;
  roughness: number | null;
  fattyAcid: number | null;
  cadmium: number | null;
  aflatoxinB1: number | null;
  lead: number | null;
  mercury: number | null;
  inorganicArsenic: number | null;
  colorSmell: string;
}

export interface WarehouseLocationCardQualityInspectionSaveParam {
  id?: number | string;
  warehouseId?: number;
  inspectionTime: number;
  inspector: string;
  moisture: number | null;
  impurity: number | null;
  mixedRate: number | null;
  headRiceRate: number | null;
  outOfPaddyBrownRiceRate: number | null;
  yellowRiceRate: number | null;
  tasteScore: number | null;
  roughness: number | null;
  fattyAcid: number | null;
  cadmium: number | null;
  aflatoxinB1: number | null;
  lead: number | null;
  mercury: number | null;
  inorganicArsenic: number | null;
  colorSmell: string;
}

export interface WarehouseLocationCardEnvironmentMonitorVO {
  maxTemperature: number | null;
  minTemperature: number | null;
  avgTemperature: number | null;
  co2Ppm: number | null;
  o2Percent: number | null;
  ph3Ppm: number | null;
  humidity: number | null;
}

export interface WarehouseLocationCardConfigDetailVO {
  profile: WarehouseLocationCardPositionProfileVO | null;
  qualityInspections: WarehouseLocationCardQualityInspectionVO[];
  environmentMonitor: WarehouseLocationCardEnvironmentMonitorVO | null;
}

export interface WarehouseLocationCardFieldChangeLogVO {
  id: number | string;
  warehouseId: number;
  bizType: string;
  bizId: number | string | null;
  changeSummary: string;
  changeContent: string;
  createBy: string;
  createTime: string | number;
}

/**
 * 应用关联设备分页 `records[]` 单条。
 * 兼容旧结构（id/name/code/thirdPartyId/typeName/productInfo）与 OpenAPI `ApplicationRelatedDeviceVO`
 *（deviceId、deviceName、deviceType、productName、areaId、areaName）。
 */
export interface LiangcangApplicationDevicePageItem {
  /** 旧：设备中心 id，作绑定入参 */
  id?: string;
  /** 新：业务设备 id（int64，作绑定入参） */
  deviceId?: number | string;
  name?: string;
  deviceName?: string;
  code?: string;
  thirdPartyId?: string;
  typeName?: string;
  deviceType?: string;
  productName?: string;
  areaName?: string;
  areaId?: string;
  area?: {
    name?: string;
    pathName?: string;
  };
  productInfo?: {
    name?: string;
    productCategory?: { name?: string };
  };
}

export interface LiangcangDeviceProductOption {
  id: string;
  name: string;
}

export interface LiangcangAreaTreeItem {
  id: string;
  name: string;
  children?: LiangcangAreaTreeItem[];
}

/**
 * GET `/liangcang/warehouse-management/statistics` 响应字段
 */

/** `items[]` 单条：日汇总/月汇总等聚合行 */
export interface LiangcangWarehouseStatisticsRow {
  timeDimension: string;
  warehouseId: number | null;
  warehouseName: string;
  type: string;
  level: string;
  warehouseHeight: number | null;
  averageEmptyWarehouseVolume: number | null;
  averageInventory: number | null;
  averageInventoryWeight: number | null;
  turnoverRate: number | null;
}

/** `acquisitionItems[]` 单条：每次雷达测量原始记录（日维度下有效） */
export interface LiangcangAcquisitionItem {
  /** 测量时间（完整时间字符串，如 "2026-04-08 18:00:00"） */
  acquisitionTime: string;
  warehouseId: number | null;
  warehouseName: string;
  type: string;
  level: string;
  warehouseHeight: number | null;
  /** 空仓体积 */
  emptyWarehouseVolume: number | null;
  /** 货物体积 */
  goodsVolume: number | null;
  /** 重量（吨） */
  weight: number | null;
  turnoverRate: number | null;
}

/** `acquisitionTurnoverItems[]` 单条：每次采集的周转率（日维度柱状图散点用） */
export interface LiangcangAcquisitionTurnoverItem {
  timeDimension: string;
  turnoverRate: number | null;
  acquisitionTime: string;
}

/** `timeDimensionTurnovers[]` 单条：按时间维度汇聚的平均周转率 */
export interface LiangcangTimeDimensionTurnoverItem {
  timeDimension: string;
  averageTurnoverRate: number | null;
}

/** `timeDimensionTurnoverYearOnYearTrend[]` / `timeDimensionTurnoverChainRatioTrend[]` 单条 */
export interface LiangcangTimeDimensionTrendItem {
  timeDimension: string;
  /** 变化量（同比/环比）：当期值 - 对比期值 */
  changeRate: number | null;
}

export interface LiangcangWarehouseStatisticsVO {
  /** 汇总明细行（日/月/季/年） */
  items: LiangcangWarehouseStatisticsRow[];
  /** 每次雷达采集原始记录（日维度有效） */
  acquisitionItems: LiangcangAcquisitionItem[];
  /** 每次采集周转率（日维度柱状图散点） */
  acquisitionTurnoverItems: LiangcangAcquisitionTurnoverItem[];
  /** 期内平均周转率 */
  averageTurnoverRate: number | null;
  /** 去年同期平均周转率 */
  lastYearSamePeriodAverageTurnoverRate: number | null;
  /** 同比变化量（当期均值 - 去年同期均值） */
  totalYearOnYearChangeRate: number | null;
  /** 上期平均周转率 */
  previousPeriodAverageTurnoverRate: number | null;
  /** 环比变化量（当期均值 - 上期均值） */
  totalChainRatioChangeRate: number | null;
  /** 按时间维度汇聚的平均周转率（本期趋势图） */
  timeDimensionTurnovers: LiangcangTimeDimensionTurnoverItem[];
  /** 同比趋势（各时间维度变化量） */
  timeDimensionTurnoverYearOnYearTrend: LiangcangTimeDimensionTrendItem[];
  /** 环比趋势（各时间维度变化量） */
  timeDimensionTurnoverChainRatioTrend: LiangcangTimeDimensionTrendItem[];
}

/** OUAA 部门列表项（`/ouaa/authenticated/organizations/list`） */
export interface OuaaDepartmentItem {
  id: string | number;
  name: string;
  enabled?: boolean;
  level?: number;
  parentId?: string | number | null;
  members?: number | string | null;
  children?: OuaaDepartmentItem[];
}

/** OUAA 人员分页列表项（`/ouaa/authenticated/user-under-tenant/page`） */
export interface OuaaStaffItem {
  id: string | number;
  name: string;
  mobile?: string;
  organizations?: Array<{ id: string; name: string }>;
}

export interface OuaaRoleItem {
  id: string;
  name: string;
  enabled?: boolean;
}

/**
 * POST `/liangcang/warehouse-permission/bindings` 请求体（Apifox：`WarehousePersonPermissionUpdateParam`）
 * `personIds` 为空或不传表示清空该仓绑定。
 */
/** `personIds` 使用 string[]，避免 int64 在 JSON number 与 JS Number 中精度丢失（与接口实际返回 string[] 一致）。 */
export interface LiangcangWarehousePermissionBindingPayload {
  warehouseId: number;
  personIds: string[];
}

export type LiangcangTemperatureAggType = "MAX" | "MIN";
export type LiangcangTemperatureLayerCode = "UPPER" | "MIDDLE" | "LOWER";

export interface LiangcangWarehouseTemperatureTrendLayer {
  layerConfigId?: number;
  layerCode: LiangcangTemperatureLayerCode;
  layerName: string;
  positionName: string;
  selectedCableIds: number[];
  highAlarmThreshold: number;
  lowAlarmThreshold: number;
  layerAggType: LiangcangTemperatureAggType;
  sortNo?: number;
}

export interface LiangcangWarehouseTemperatureTrendConfigVO {
  configId?: number;
  warehouseId: number;
  highAlarmThreshold?: number;
  lowAlarmThreshold?: number;
  warehouseAggType: LiangcangTemperatureAggType;
  layers: LiangcangWarehouseTemperatureTrendLayer[];
}

export interface LiangcangWarehouseTemperatureTrendConfigSaveParamLayer {
  layerCode: LiangcangTemperatureLayerCode;
  layerName: string;
  positionName: string;
  selectedCableIds: number[];
  highAlarmThreshold: number;
  lowAlarmThreshold: number;
  layerAggType: LiangcangTemperatureAggType;
}

export interface LiangcangWarehouseTemperatureTrendConfigSaveParam {
  warehouseId: number;
  highAlarmThreshold: number;
  lowAlarmThreshold: number;
  warehouseAggType: LiangcangTemperatureAggType;
  layers: LiangcangWarehouseTemperatureTrendConfigSaveParamLayer[];
}

export type LiangcangTemperatureTrendScope = "ALL" | "UPPER" | "MIDDLE" | "LOWER";
export type LiangcangTemperatureTrendStatus = "NORMAL" | "HIGH" | "LOW";
export type LiangcangWarehouseTemperatureReportStatus = "NORMAL" | "HIGH" | "LOW" | "NO_DATA";

export interface LiangcangWarehouseTemperatureTrendStatisticsParam {
  warehouseId: number;
  scope?: LiangcangTemperatureTrendScope;
  forecastDays?: number;
  endTime?: string;
}

export interface LiangcangWarehouseTemperatureTrendPoint {
  date: string;
  time: string;
  temperature: number;
}

export interface LiangcangWarehouseTemperatureTrendCard {
  scope: LiangcangTemperatureTrendScope;
  name: string;
  temperature: number;
  status: LiangcangTemperatureTrendStatus;
  highAlarmThreshold: number;
  lowAlarmThreshold: number;
}

export interface LiangcangWarehouseTemperatureTrendChart {
  scope: LiangcangTemperatureTrendScope;
  warningLine: number;
  actualSeries: LiangcangWarehouseTemperatureTrendPoint[];
  forecastSeries: LiangcangWarehouseTemperatureTrendPoint[];
}

export interface LiangcangWarehouseTemperatureTrendStatisticsVO {
  updateTime: string;
  cards: LiangcangWarehouseTemperatureTrendCard[];
  chart: LiangcangWarehouseTemperatureTrendChart | null;
}

/** 粮仓温度报表查询参数（POST `/liangcang/warehouse-management/temperature-report/list`）。 */
export interface LiangcangWarehouseTemperatureReportParam {
  warehouseId: number;
}

/** 粮仓温度报表点位。 */
export interface LiangcangWarehouseTemperatureReportPointVO {
  cableNo: string;
  pointNo: string;
  deviceId: number | null;
  deviceName: string;
  temperature: number | null;
  status: LiangcangWarehouseTemperatureReportStatus;
}

export type LiangcangTemperatureAlertStatus = "ACTIVE" | "CLEARED";
export type LiangcangTemperatureAlertClearReason = "TREND_REVERSED" | "LEFT_DANGER_ZONE" | string;

export interface LiangcangTemperatureAlertGlobalConfigVO {
  id?: number;
  consecutiveDays: number;
  minDailyIncrease: number;
  warningThreshold: number;
  approachMargin: number;
}

export interface LiangcangTemperatureAlertGlobalConfigSaveParam {
  consecutiveDays: number;
  minDailyIncrease: number;
  warningThreshold: number;
  approachMargin: number;
}

export interface LiangcangTemperatureAlertConfigVO {
  id?: number;
  warehouseId: number;
  useGlobalDefault: boolean;
  consecutiveDays?: number | null;
  minDailyIncrease?: number | null;
  warningThreshold?: number | null;
  approachMargin?: number | null;
  popupEnabled: boolean;
}

export interface LiangcangTemperatureAlertWarehouseConfigVO {
  warehouseId: number;
  warehouseName: string;
  grainType: string;
  useGlobalDefault: boolean;
  popupEnabled: boolean;
  globalConfig: LiangcangTemperatureAlertGlobalConfigVO;
  warehouseConfig: LiangcangTemperatureAlertConfigVO | null;
  effectiveConfig: LiangcangTemperatureAlertGlobalConfigVO;
}

export interface LiangcangTemperatureAlertWarehouseConfigSaveParam {
  warehouseId: number;
  useGlobalDefault: boolean;
  consecutiveDays?: number | null;
  minDailyIncrease?: number | null;
  warningThreshold?: number | null;
  approachMargin?: number | null;
  popupEnabled: boolean;
}

export interface LiangcangTemperatureAlertRecordPageParam {
  pageNumber: number;
  pageSize: number;
  startTime?: string;
  endTime?: string;
  warehouseIds?: number[];
  statuses?: LiangcangTemperatureAlertStatus[];
}

export interface LiangcangTemperatureAlertRecordVO {
  id: number;
  warehouseId: number;
  warehouseName: string;
  grainType: string;
  triggeredAt: string;
  currentAvgTemperature: number | null;
  warningThreshold: number | null;
  approachMargin: number | null;
  distanceToThreshold: number | null;
  dailyIncrease: number | null;
  consecutiveDays: number | null;
  status: LiangcangTemperatureAlertStatus;
  clearedAt: string;
  clearedReason: LiangcangTemperatureAlertClearReason;
  popupEnabled: boolean;
  popupPushed: boolean;
}

export interface LiangcangTemperatureAlertTrendParam {
  warehouseId: number;
  startDate?: string;
  endDate?: string;
}

export interface LiangcangTemperatureAlertTrendPoint {
  date: string;
  time: string;
  temperature: number | null;
  triggered: boolean;
}

export interface LiangcangTemperatureAlertNoticeVO {
  alerting: boolean;
  message: string;
  distanceToThreshold: number | null;
  currentAvgTemperature: number | null;
  warningThreshold: number | null;
  alertRecordId: number | null;
  triggeredAt: string;
}

export interface LiangcangTemperatureAlertTrendVO {
  warehouseId: number;
  warehouseName: string;
  grainType: string;
  warningThreshold: number | null;
  approachMargin: number | null;
  warningLine: number | null;
  series: LiangcangTemperatureAlertTrendPoint[];
  alertNotice: LiangcangTemperatureAlertNoticeVO | null;
}

export interface LiangcangTemperatureAlertSampleParam {
  warehouseId: number;
  startDate?: string;
  endDate?: string;
}

export interface LiangcangTemperatureAlertSampleItem {
  warehouseName: string;
  sampleTime: string;
  maxTemperature: number | null;
}

export interface LiangcangTemperatureAlertSampleDayVO {
  date: string;
  complete: boolean;
  sampleCount: number;
  avgMaxTemperature: number | null;
  items: LiangcangTemperatureAlertSampleItem[];
}

export type WarehouseStorageArchiveStatus = "NORMAL" | "ALARM";

export interface WarehouseStorageArchiveBasicInfoVO {
  warehouseId: number;
  warehouseName: string;
  grainType: string;
  currentVolume: number | null;
  volumeWarningValue: number | null;
  volumeDifferenceWarningValue: number | null;
  latestScanTime: string;
}

export type WarehouseStorageArchiveTrendTimeType = "TODAY" | "THIS_MONTH" | "THIS_YEAR" | "CUSTOM";

export type WarehouseStorageArchiveTrendGranularity = "HALF_HOUR" | "DAY" | "MONTH";

export interface WarehouseStorageArchiveTrendParam {
  warehouseId: number;
  timeType?: WarehouseStorageArchiveTrendTimeType;
  startTime?: string;
  endTime?: string;
}

export interface WarehouseStorageArchiveTrendItem {
  time: string;
  storageValue: number | null;
  warningValue: number | null;
  alarm: boolean;
}

export interface WarehouseStorageArchiveTrendVO {
  unit: string;
  warningValue: number | null;
  granularity: WarehouseStorageArchiveTrendGranularity;
  items: WarehouseStorageArchiveTrendItem[];
}

export interface WarehouseStorageArchiveScanRecordPageParam {
  pageNumber: number;
  pageSize: number;
  warehouseId: number;
  startTime?: string;
  endTime?: string;
  status?: WarehouseStorageArchiveStatus | "";
}

export interface WarehouseStorageArchiveScanRecordVO {
  id: number | string;
  warehouseId: number;
  warehouseName: string;
  scanTime: string;
  currentVolume: number | null;
  volumeChange: number | null;
  volumeWarningValue: number | null;
  volumeDifference: number | null;
  volumeDifferenceWarningValue: number | null;
  status: WarehouseStorageArchiveStatus;
  statusName: string;
}

export interface GasArchiveBasicInfoVO {
  warehouseId: number;
  warehouseName: string;
  co2: number | null;
  o2: number | null;
  ph3: number | null;
  co2Alarm: boolean;
  o2Alarm: boolean;
  ph3Alarm: boolean;
}

export interface GasArchiveTrendParam {
  warehouseId: number;
  date: string;
}

export interface GasArchiveTrendItem {
  sampleTime: string | number;
  co2: number | null;
  o2: number | null;
  ph3: number | null;
  co2Alarm: boolean;
  o2Alarm: boolean;
  ph3Alarm: boolean;
}

export interface GasArchiveTrendVO {
  date: string;
  items: GasArchiveTrendItem[];
}

export interface GasArchiveRecordPageParam {
  pageNumber: number;
  pageSize: number;
  warehouseId: number;
  startTime?: string;
  endTime?: string;
}

export interface GasArchiveRecordVO {
  id: number | string;
  warehouseId: number;
  acquisitionTime: string;
  co2: number | null;
  o2: number | null;
  ph3: number | null;
  co2Alarm: boolean;
  o2Alarm: boolean;
  ph3Alarm: boolean;
}

export type LiangcangCableMappingStatus = "mapped" | "partial" | "unmapped";

/** 电缆列表项（GET `/liangcang/warehouse-management/cable-mapping/cable/list`） */
export interface LiangcangWarehouseCableListItem {
  cableId: number;
  warehouseId: number;
  cableNo: string;
  pointCount: number;
  mappedCount: number;
  status: LiangcangCableMappingStatus;
}

/** 点位映射列表项（GET `/liangcang/warehouse-management/cable-mapping/point/list`） */
export interface LiangcangWarehouseCablePointMappingItem {
  pointId: number;
  cableId: number;
  warehouseId: number;
  pointNo: number;
  deviceId: number | null;
  deviceCode: string;
  deviceName: string;
  status: LiangcangCableMappingStatus | "unmapped" | "mapped";
}

/** 新增电缆（POST `/liangcang/warehouse-management/cable-mapping/cable/create`） */
export interface LiangcangWarehouseCableCreatePayload {
  warehouseId: number;
  cableNo: string;
  pointCount: number;
}

/** 删除电缆（POST `/liangcang/warehouse-management/cable-mapping/cable/delete`） */
export interface LiangcangWarehouseCableDeletePayload {
  cableId: number;
}

/** 可选设备分页项（GET `/liangcang/warehouse-management/cable-mapping/available-devices/page`） */
export interface LiangcangWarehouseCableAvailableDeviceItem {
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  deviceType: string;
  mapped: boolean;
  mappedCableId: number | null;
  mappedCableNo: string;
  mappedPointNo: number | null;
  status: LiangcangCableMappingStatus | "mapped" | "unmapped";
}

/** 点位映射创建参数中的单项 */
export interface LiangcangWarehouseCablePointMappingPayloadItem {
  pointNo: number;
  deviceId: string;
}

/** 批量新增点位映射（POST `/liangcang/warehouse-management/cable-mapping/point/mapping/create`） */
export interface LiangcangWarehouseCablePointMappingCreatePayload {
  cableId: number;
  mappings: LiangcangWarehouseCablePointMappingPayloadItem[];
}

/** 批量解绑点位（POST `/liangcang/warehouse-management/cable-mapping/point/unbind`） */
export interface LiangcangWarehouseCablePointUnbindPayload {
  pointIds?: number[];
  cableId?: number;
  pointNos?: number[];
}
