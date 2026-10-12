import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API, type PageResultState } from "@ghcloud/cube-protocol";

import {
  parseApplicationDevicesPageResponse,
  parseBooleanResponse,
  parseBoundWarehouseSimpleList,
  parseJsonArray,
  parseLocationCardInfoResponse,
  parsePageResultState,
  parseRadarBindingDetailResponse,
  parseRadarMonitoringAlarmResponse,
  parseRadarMonitoringDashboardResponse,
  parseRadarMonitoringSummaryResponse,
  parseRadarMonitoringWarehousesResponse,
  parseGasMonitoringDashboardResponse,
  parseGasMonitoringSummaryResponse,
  parseGasMonitoringWarehousesResponse,
  parseGasMonitoringAlarmResponse,
  parseTemperatureHumidityMonitoringDashboardResponse,
  parseTemperatureHumidityMonitoringSummaryResponse,
  parseTemperatureHumidityMonitoringWarehousesResponse,
  parseTemperatureHumidityMonitoringAlertsResponse,
  parseWarehousePersonPermissionList,
  parseWarehouseStatisticsResponse,
  parseWarehouseTemperatureTrendStatisticsResponse,
  unwrapGatewayData,
} from "./application-devices-api";
import type {
  HealthStatus,
  LiangcangWarehouseCableAvailableDeviceItem,
  LiangcangWarehouseCableCreatePayload,
  LiangcangWarehouseCableDeletePayload,
  LiangcangWarehouseCableListItem,
  LiangcangWarehouseCablePointMappingCreatePayload,
  LiangcangWarehouseCablePointMappingItem,
  LiangcangWarehouseCablePointUnbindPayload,
  LiangcangAreaTreeItem,
  LiangcangApplicationDevicePageItem,
  LiangcangBoundWarehouseDevicePageItem,
  LiangcangBoundWarehousePageItem,
  LiangcangBoundWarehouseSimpleItem,
  LiangcangDeviceProductOption,
  LiangcangRadarBindingDetailVO,
  LiangcangRadarMonitoringAlarmVO,
  LiangcangRadarMonitoringSummaryVO,
  LiangcangRadarMonitoringDashboardVO,
  LiangcangGasMonitoringAlarmVO,
  LiangcangGasMonitoringSummaryVO,
  LiangcangGasMonitoringDashboardVO,
  LiangcangTemperatureHumidityMonitoringAlertVO,
  LiangcangTemperatureHumidityMonitoringSummaryVO,
  LiangcangTemperatureHumidityMonitoringDashboardVO,
  OuaaDepartmentItem,
  OuaaRoleItem,
  OuaaStaffItem,
  LiangcangWarehouseListItem,
  LiangcangWarehouseLocationCardInfoVO,
  LiangcangWarehousePermissionBindingPayload,
  LiangcangWarehouseRadarBindPayload,
  LiangcangWarehouseStatisticsVO,
  LiangcangWarehouseTemperatureTrendStatisticsParam,
  LiangcangWarehouseTemperatureTrendStatisticsVO,
  LiangcangWarehouseTemperatureTrendConfigSaveParam,
  LiangcangWarehouseTemperatureTrendConfigVO,
  LiangcangWarehouseTemperatureReportParam,
  LiangcangWarehouseTemperatureReportPointVO,
  LiangcangTemperatureAlertGlobalConfigSaveParam,
  LiangcangTemperatureAlertGlobalConfigVO,
  LiangcangTemperatureAlertRecordPageParam,
  LiangcangTemperatureAlertRecordVO,
  LiangcangTemperatureAlertSampleDayVO,
  LiangcangTemperatureAlertSampleParam,
  LiangcangTemperatureAlertTrendParam,
  LiangcangTemperatureAlertTrendVO,
  LiangcangTemperatureAlertWarehouseConfigSaveParam,
  LiangcangTemperatureAlertWarehouseConfigVO,
  LiangcangWarehouseUnbindPayload,
  WarehouseLocationCardBoundWarehousePageItem,
  WarehouseLocationCardBoundWarehousePageParam,
  WarehouseLocationCardConfigDetailVO,
  WarehouseLocationCardFieldChangeLogVO,
  WarehouseLocationCardPositionProfileSaveParam,
  WarehouseLocationCardQualityInspectionSaveParam,
  WarehouseStorageArchiveBasicInfoVO,
  WarehouseStorageArchiveScanRecordPageParam,
  WarehouseStorageArchiveScanRecordVO,
  WarehouseStorageArchiveTrendParam,
  WarehouseStorageArchiveTrendVO,
  GasArchiveBasicInfoVO,
  GasArchiveRecordPageParam,
  GasArchiveRecordVO,
  GasArchiveTrendParam,
  GasArchiveTrendVO,
} from "./types";

/** 长沙霞岭网关路径前缀，与后端路由一致 */
const CHANGSHA_XIALING_PREFIX = "changsha-xialing";

const baseURL = `${BASE_API}/${CHANGSHA_XIALING_PREFIX}/granary-management`;
const liangcangWarehouseBaseURL = `${BASE_API}/${CHANGSHA_XIALING_PREFIX}/liangcang/warehouse-management`;
const locationCardConfigBaseURL = `${BASE_API}/${CHANGSHA_XIALING_PREFIX}/liangcang/warehouse-location-card`;
const temperatureAlertBaseURL = `${liangcangWarehouseBaseURL}/temperature-alert`;
const storageArchiveBaseURL = `${liangcangWarehouseBaseURL}/storage-archive`;
const gasArchiveBaseURL = `${liangcangWarehouseBaseURL}/gas-archive`;

const getIdText = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return "";
};

const getText = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }
  return "";
};

const mapAreaTree = (items: unknown): LiangcangAreaTreeItem[] => {
  if (!Array.isArray(items)) {
    return [];
  }
  const result: LiangcangAreaTreeItem[] = [];
  for (const item of items) {
    if (item == null || typeof item !== "object") {
      continue;
    }
    const row = item as Record<string, unknown>;
    const id = getIdText(row.id, row.areaId);
    const name = getText(row.name, row.areaName);
    if (id === "" || name === "") {
      continue;
    }
    result.push({
      id,
      name,
      children: mapAreaTree(row.children),
    });
  }
  return result;
};

export class CubeGranaryManagementService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  public async health(): Promise<HealthStatus> {
    const url = `${baseURL}/health`;
    return await this.gateway.get<HealthStatus>({ url });
  }

  /**
   * 雷达设备列表（智慧仓库中 deviceType 为雷达的设备）。
   * GET `/liangcang/warehouse-management/warehouse/list`，响应为 `LiangcangWarehouseListItem[]`。
   */
  public async getWarehouseRadarList(): Promise<LiangcangWarehouseListItem[]> {
    const url = `${liangcangWarehouseBaseURL}/warehouse/list`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return parseJsonArray<LiangcangWarehouseListItem>(resp);
  }

  /**
   * 已绑定粮仓简要列表（与智慧仓库 id、名称、类别对齐）。
   * GET `/liangcang/warehouse-management/bound-warehouse/list`，响应为 `BoundWarehouseSimpleVO[]`。
   */
  public async getBoundWarehouseSimpleList(): Promise<LiangcangBoundWarehouseSimpleItem[]> {
    const url = `${liangcangWarehouseBaseURL}/bound-warehouse/list`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return parseBoundWarehouseSimpleList(resp);
  }

  /**
   * 粮温趋势配置详情（仓房维度）。
   * GET `/liangcang/warehouse-management/temperature-trend-config/detail`，Query：`warehouseId`
   */
  public async getWarehouseTemperatureTrendConfigDetail(warehouseId: number): Promise<LiangcangWarehouseTemperatureTrendConfigVO | null> {
    const url = `${liangcangWarehouseBaseURL}/temperature-trend-config/detail`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: { warehouseId },
    });
    const data = unwrapGatewayData(resp);
    if (data == null || typeof data !== "object" || Array.isArray(data)) {
      return null;
    }
    return data as LiangcangWarehouseTemperatureTrendConfigVO;
  }

  /**
   * 保存粮温趋势配置（仓房维度）。
   * POST `/liangcang/warehouse-management/temperature-trend-config/save`
   */
  public async saveWarehouseTemperatureTrendConfig(payload: LiangcangWarehouseTemperatureTrendConfigSaveParam): Promise<boolean> {
    const url = `${liangcangWarehouseBaseURL}/temperature-trend-config/save`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload: {
        warehouseId: payload.warehouseId,
        highAlarmThreshold: payload.highAlarmThreshold,
        lowAlarmThreshold: payload.lowAlarmThreshold,
        warehouseAggType: payload.warehouseAggType,
        layers: payload.layers,
      },
    });
    return parseBooleanResponse(resp);
  }

  /**
   * 粮温趋势统计（仓房维度）。
   * POST `/liangcang/warehouse-management/temperature-trend/statistics`
   */
  public async getWarehouseTemperatureTrendStatistics(
    payload: LiangcangWarehouseTemperatureTrendStatisticsParam,
  ): Promise<LiangcangWarehouseTemperatureTrendStatisticsVO> {
    const url = `${liangcangWarehouseBaseURL}/temperature-trend/statistics`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload: {
        warehouseId: payload.warehouseId,
        ...(payload.scope != null ? { scope: payload.scope } : {}),
        ...(payload.forecastDays != null ? { forecastDays: payload.forecastDays } : {}),
        ...(payload.endTime != null && payload.endTime !== "" ? { endTime: payload.endTime } : {}),
      },
    });
    return parseWarehouseTemperatureTrendStatisticsResponse(resp);
  }

  /**
   * 粮仓温度报表（仓房维度）。
   * POST `/liangcang/warehouse-management/temperature-report/list`
   */
  public async getWarehouseTemperatureReport(
    payload: LiangcangWarehouseTemperatureReportParam,
  ): Promise<LiangcangWarehouseTemperatureReportPointVO[][]> {
    const url = `${liangcangWarehouseBaseURL}/temperature-report/list`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload: {
        warehouseId: payload.warehouseId,
      },
    });
    const data = unwrapGatewayData(resp);
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map((groupRaw) => {
      if (!Array.isArray(groupRaw)) {
        return [];
      }
      return groupRaw.map((pointRaw) => {
        const point = pointRaw as Record<string, unknown>;
        const rawStatus = point.status;
        const status =
          rawStatus === "HIGH" || rawStatus === "LOW" || rawStatus === "NO_DATA" || rawStatus === "NORMAL" ? rawStatus : "NO_DATA";
        const rawTemperature = point.temperature;
        return {
          cableNo: getText(point.cableNo),
          pointNo: getText(point.pointNo),
          deviceId: typeof point.deviceId === "number" && Number.isFinite(point.deviceId) ? point.deviceId : null,
          deviceName: getText(point.deviceName),
          temperature: typeof rawTemperature === "number" && Number.isFinite(rawTemperature) ? rawTemperature : null,
          status,
        };
      });
    });
  }

  /** 粮仓温度趋势预警：全局默认配置。 */
  public async getTemperatureAlertGlobalConfig(): Promise<LiangcangTemperatureAlertGlobalConfigVO | null> {
    const url = `${temperatureAlertBaseURL}/config/global`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    const data = unwrapGatewayData(resp);
    if (data == null || typeof data !== "object" || Array.isArray(data)) {
      return null;
    }
    return data as LiangcangTemperatureAlertGlobalConfigVO;
  }

  /** 粮仓温度趋势预警：保存全局默认配置。 */
  public async saveTemperatureAlertGlobalConfig(payload: LiangcangTemperatureAlertGlobalConfigSaveParam): Promise<boolean> {
    const url = `${temperatureAlertBaseURL}/config/global/save`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload,
    });
    return parseBooleanResponse(resp);
  }

  /** 粮仓温度趋势预警：单仓配置详情。 */
  public async getTemperatureAlertWarehouseConfig(warehouseId: number): Promise<LiangcangTemperatureAlertWarehouseConfigVO | null> {
    const url = `${temperatureAlertBaseURL}/config/warehouse/detail`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: { warehouseId },
    });
    const data = unwrapGatewayData(resp);
    if (data == null || typeof data !== "object" || Array.isArray(data)) {
      return null;
    }
    return data as LiangcangTemperatureAlertWarehouseConfigVO;
  }

  /** 粮仓温度趋势预警：保存单仓配置。 */
  public async saveTemperatureAlertWarehouseConfig(payload: LiangcangTemperatureAlertWarehouseConfigSaveParam): Promise<boolean> {
    const url = `${temperatureAlertBaseURL}/config/warehouse/save`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload,
    });
    return parseBooleanResponse(resp);
  }

  /** 粮仓温度趋势预警：恢复单仓全局默认。 */
  public async resetTemperatureAlertWarehouseConfig(warehouseId: number): Promise<boolean> {
    const url = `${temperatureAlertBaseURL}/config/warehouse/reset`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload: { warehouseId },
    });
    return parseBooleanResponse(resp);
  }

  /** 粮仓温度趋势预警：预警记录分页。 */
  public async getTemperatureAlertRecordPage(
    payload: LiangcangTemperatureAlertRecordPageParam,
  ): Promise<PageResultState<LiangcangTemperatureAlertRecordVO>> {
    const url = `${temperatureAlertBaseURL}/records/page`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: {
        pageNumber: payload.pageNumber,
        pageSize: payload.pageSize,
        ...(payload.startTime != null && payload.endTime != null ? { period: `${payload.startTime},${payload.endTime}` } : {}),
        ...(payload.warehouseIds != null && payload.warehouseIds.length > 0 ? { warehouseIds: payload.warehouseIds } : {}),
        ...(payload.statuses != null && payload.statuses.length > 0 ? { statuses: payload.statuses } : {}),
      },
    });
    return parsePageResultState<LiangcangTemperatureAlertRecordVO>(resp);
  }

  /** 粮仓温度趋势预警：预警记录导出。 */
  public async exportTemperatureAlertRecords(payload: LiangcangTemperatureAlertRecordPageParam): Promise<Blob> {
    const url = `${temperatureAlertBaseURL}/records/export`;
    return await this.gateway.customBlob({
      method: "GET",
      url,
      payload: {
        ...(payload.startTime != null && payload.endTime != null ? { period: `${payload.startTime},${payload.endTime}` } : {}),
        ...(payload.warehouseIds != null && payload.warehouseIds.length > 0 ? { warehouseIds: payload.warehouseIds } : {}),
        ...(payload.statuses != null && payload.statuses.length > 0 ? { statuses: payload.statuses } : {}),
      },
    });
  }

  /** 粮仓温度趋势预警：温度走势。 */
  public async getTemperatureAlertTrend(payload: LiangcangTemperatureAlertTrendParam): Promise<LiangcangTemperatureAlertTrendVO | null> {
    const url = `${temperatureAlertBaseURL}/trend`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: {
        warehouseId: payload.warehouseId,
        ...(payload.startDate != null && payload.startDate !== "" ? { startDate: payload.startDate } : {}),
        ...(payload.endDate != null && payload.endDate !== "" ? { endDate: payload.endDate } : {}),
      },
    });
    const data = unwrapGatewayData(resp);
    if (data == null || typeof data !== "object" || Array.isArray(data)) {
      return null;
    }
    return data as LiangcangTemperatureAlertTrendVO;
  }

  /** 粮仓温度趋势预警：采样明细。 */
  public async getTemperatureAlertSamples(payload: LiangcangTemperatureAlertSampleParam): Promise<LiangcangTemperatureAlertSampleDayVO[]> {
    const url = `${temperatureAlertBaseURL}/samples`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: {
        warehouseId: payload.warehouseId,
        ...(payload.startDate != null && payload.startDate !== "" ? { startDate: payload.startDate } : {}),
        ...(payload.endDate != null && payload.endDate !== "" ? { endDate: payload.endDate } : {}),
      },
    });
    return parseJsonArray<LiangcangTemperatureAlertSampleDayVO>(resp);
  }

  /** 粮仓温度趋势预警：采样明细导出。 */
  public async exportTemperatureAlertSamples(payload: LiangcangTemperatureAlertSampleParam): Promise<Blob> {
    const url = `${temperatureAlertBaseURL}/samples/export`;
    return await this.gateway.customBlob({
      method: "GET",
      url,
      payload: {
        warehouseId: payload.warehouseId,
        ...(payload.startDate != null && payload.startDate !== "" ? { startDate: payload.startDate } : {}),
        ...(payload.endDate != null && payload.endDate !== "" ? { endDate: payload.endDate } : {}),
      },
    });
  }

  /** 储量档案：基本信息。 */
  public async getStorageArchiveBasicInfo(warehouseId: number): Promise<WarehouseStorageArchiveBasicInfoVO | null> {
    const url = `${storageArchiveBaseURL}/basic-info`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: { warehouseId },
    });
    const data = unwrapGatewayData(resp);
    if (data == null || typeof data !== "object" || Array.isArray(data)) {
      return null;
    }
    return data as WarehouseStorageArchiveBasicInfoVO;
  }

  /** 储量档案：变化曲线。 */
  public async getStorageArchiveTrend(payload: WarehouseStorageArchiveTrendParam): Promise<WarehouseStorageArchiveTrendVO | null> {
    const url = `${storageArchiveBaseURL}/trend`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: {
        warehouseId: payload.warehouseId,
        ...(payload.timeType != null ? { timeType: payload.timeType } : {}),
        ...(payload.startTime != null && payload.endTime != null ? { period: `${payload.startTime},${payload.endTime}` } : {}),
      },
    });
    const data = unwrapGatewayData(resp);
    if (data == null || typeof data !== "object" || Array.isArray(data)) {
      return null;
    }
    return data as WarehouseStorageArchiveTrendVO;
  }

  /** 储量档案：扫描记录分页。 */
  public async getStorageArchiveScanRecordPage(
    payload: WarehouseStorageArchiveScanRecordPageParam,
  ): Promise<PageResultState<WarehouseStorageArchiveScanRecordVO>> {
    const url = `${storageArchiveBaseURL}/scan-records/page`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: {
        pageNumber: payload.pageNumber,
        pageSize: payload.pageSize,
        warehouseId: payload.warehouseId,
        ...(payload.startTime != null && payload.endTime != null ? { period: `${payload.startTime},${payload.endTime}` } : {}),
        ...(payload.status != null && payload.status !== "" ? { status: payload.status } : {}),
      },
    });
    return parsePageResultState<WarehouseStorageArchiveScanRecordVO>(resp);
  }

  /** 储量档案：导出扫描记录。 */
  public async exportStorageArchiveScanRecords(payload: WarehouseStorageArchiveScanRecordPageParam): Promise<Blob> {
    const url = `${storageArchiveBaseURL}/scan-records/export`;
    return await this.gateway.customBlob({
      method: "GET",
      url,
      payload: {
        warehouseId: payload.warehouseId,
        ...(payload.startTime != null && payload.endTime != null ? { period: `${payload.startTime},${payload.endTime}` } : {}),
        ...(payload.status != null && payload.status !== "" ? { status: payload.status } : {}),
      },
    });
  }

  /** 气体档案：仓房当前浓度。 */
  public async getGasArchiveBasicInfo(warehouseId: number): Promise<GasArchiveBasicInfoVO | null> {
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url: `${gasArchiveBaseURL}/basic-info`,
      payload: { warehouseId },
    });
    const data = unwrapGatewayData(resp);
    return data != null && typeof data === "object" && !Array.isArray(data) ? (data as GasArchiveBasicInfoVO) : null;
  }

  /** 气体档案：指定日期的 30 分钟趋势。 */
  public async getGasArchiveTrend(payload: GasArchiveTrendParam): Promise<GasArchiveTrendVO | null> {
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url: `${gasArchiveBaseURL}/trend`,
      payload: { warehouseId: payload.warehouseId, date: payload.date },
    });
    const data = unwrapGatewayData(resp);
    return data != null && typeof data === "object" && !Array.isArray(data) ? (data as GasArchiveTrendVO) : null;
  }

  /** 气体档案：采集记录分页。 */
  public async getGasArchiveRecordPage(payload: GasArchiveRecordPageParam): Promise<PageResultState<GasArchiveRecordVO>> {
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url: `${gasArchiveBaseURL}/records/page`,
      payload: {
        pageNumber: payload.pageNumber,
        pageSize: payload.pageSize,
        warehouseId: payload.warehouseId,
        ...(payload.startTime != null && payload.endTime != null ? { period: `${payload.startTime},${payload.endTime}` } : {}),
      },
    });
    return parsePageResultState<GasArchiveRecordVO>(resp);
  }

  /** 气体档案：导出采集记录。 */
  public async exportGasArchiveRecords(payload: Omit<GasArchiveRecordPageParam, "pageNumber" | "pageSize">): Promise<Blob> {
    return await this.gateway.customBlob({
      method: "GET",
      url: `${gasArchiveBaseURL}/records/export`,
      payload: {
        warehouseId: payload.warehouseId,
        ...(payload.startTime != null && payload.endTime != null ? { period: `${payload.startTime},${payload.endTime}` } : {}),
      },
    });
  }

  /**
   * 电缆列表（仓房维度）。
   * GET `/liangcang/warehouse-management/cable-mapping/cable/list`，Query：`warehouseId`
   */
  public async getWarehouseCableList(warehouseId: number): Promise<LiangcangWarehouseCableListItem[]> {
    const url = `${liangcangWarehouseBaseURL}/cable-mapping/cable/list`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: { warehouseId },
    });
    return parseJsonArray<LiangcangWarehouseCableListItem>(resp);
  }

  /**
   * 电缆点位映射列表。
   * GET `/liangcang/warehouse-management/cable-mapping/point/list`，Query：`cableId`
   */
  public async getWarehouseCablePointList(cableId: number): Promise<LiangcangWarehouseCablePointMappingItem[]> {
    const url = `${liangcangWarehouseBaseURL}/cable-mapping/point/list`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: { cableId },
    });
    return parseJsonArray<LiangcangWarehouseCablePointMappingItem>(resp);
  }

  /**
   * 新增电缆并生成点位。
   * POST `/liangcang/warehouse-management/cable-mapping/cable/create`
   */
  public async createWarehouseCable(payload: LiangcangWarehouseCableCreatePayload): Promise<boolean> {
    const url = `${liangcangWarehouseBaseURL}/cable-mapping/cable/create`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload: {
        warehouseId: payload.warehouseId,
        cableNo: payload.cableNo,
        pointCount: payload.pointCount,
      },
    });
    return parseBooleanResponse(resp);
  }

  /**
   * 删除电缆及其点位映射。
   * POST `/liangcang/warehouse-management/cable-mapping/cable/delete`
   */
  public async deleteWarehouseCable(payload: LiangcangWarehouseCableDeletePayload): Promise<boolean> {
    const url = `${liangcangWarehouseBaseURL}/cable-mapping/cable/delete`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload: {
        cableId: payload.cableId,
      },
    });
    return parseBooleanResponse(resp);
  }

  /**
   * 可选设备分页（支持仅看未映射、关键字）。
   * GET `/liangcang/warehouse-management/cable-mapping/available-devices/page`
   */
  public async getCableAvailableDevicesPage(payload: {
    pageNumber: number;
    pageSize: number;
    warehouseId: number;
    deviceName?: string;
    onlyUnmapped?: boolean;
  }): Promise<PageResultState<LiangcangWarehouseCableAvailableDeviceItem>> {
    const url = `${liangcangWarehouseBaseURL}/cable-mapping/available-devices/page`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: {
        pageNumber: payload.pageNumber,
        pageSize: payload.pageSize,
        warehouseId: payload.warehouseId,
        ...(payload.deviceName != null && payload.deviceName !== "" ? { deviceName: payload.deviceName } : {}),
        ...(payload.onlyUnmapped != null ? { onlyUnmapped: payload.onlyUnmapped } : {}),
      },
    });
    return parsePageResultState<LiangcangWarehouseCableAvailableDeviceItem>(resp);
  }

  /**
   * 批量新增点位设备映射。
   * POST `/liangcang/warehouse-management/cable-mapping/point/mapping/create`
   */
  public async createCablePointMappings(payload: LiangcangWarehouseCablePointMappingCreatePayload): Promise<boolean> {
    const url = `${liangcangWarehouseBaseURL}/cable-mapping/point/mapping/create`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload: {
        cableId: payload.cableId,
        mappings: payload.mappings,
      },
    });
    return parseBooleanResponse(resp);
  }

  /**
   * 批量解绑点位映射。
   * POST `/liangcang/warehouse-management/cable-mapping/point/unbind`
   */
  public async unbindCablePoints(payload: LiangcangWarehouseCablePointUnbindPayload): Promise<boolean> {
    const url = `${liangcangWarehouseBaseURL}/cable-mapping/point/unbind`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload: {
        ...(Array.isArray(payload.pointIds) && payload.pointIds.length > 0 ? { pointIds: payload.pointIds } : {}),
        ...(payload.cableId != null ? { cableId: payload.cableId } : {}),
        ...(Array.isArray(payload.pointNos) && payload.pointNos.length > 0 ? { pointNos: payload.pointNos } : {}),
      },
    });
    return parseBooleanResponse(resp);
  }

  /**
   * 粮仓统计（周转率趋势与明细）。
   * GET `/liangcang/warehouse-management/statistics`
   * Query：`dimension`、`period`（`begin,end` 逗号分隔，如 `2026-03-01 00:00:00,2026-03-31 00:00:00`）、可选 `warehouseId`、`warehouseCategory`（与智慧仓库种类名一致）。
   */
  public async getWarehouseStatistics(payload: {
    dimension: "DAY" | "MONTH" | "QUARTER" | "YEAR";
    period: string;
    warehouseId?: number;
    warehouseCategory?: string;
  }): Promise<LiangcangWarehouseStatisticsVO> {
    const url = `${liangcangWarehouseBaseURL}/statistics`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: {
        dimension: payload.dimension,
        period: payload.period,
        ...(payload.warehouseId != null ? { warehouseId: payload.warehouseId } : {}),
        ...(payload.warehouseCategory != null && payload.warehouseCategory !== "" ? { warehouseCategory: payload.warehouseCategory } : {}),
      },
    });
    return parseWarehouseStatisticsResponse(resp);
  }

  /**
   * 粮仓绑定状态分页（粮仓名称、类别、等级、高度、容积等）。
   * GET `/liangcang/warehouse-management/warehouse-info/page`
   * Query：`pageNumber`、`pageSize`、可选 `radarName`、可选 `bindingStatus`（`true` 已创建，`false` 未创建）
   */
  public async getBoundWarehouseInfoPage(payload: {
    pageNumber: number;
    pageSize: number;
    radarName?: string;
    bindingStatus?: boolean;
  }): Promise<PageResultState<LiangcangBoundWarehousePageItem>> {
    const url = `${liangcangWarehouseBaseURL}/warehouse-info/page`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: {
        pageNumber: payload.pageNumber,
        pageSize: payload.pageSize,
        ...(payload.radarName != null && payload.radarName !== "" ? { radarName: payload.radarName } : {}),
        ...(payload.bindingStatus != null ? { bindingStatus: payload.bindingStatus } : {}),
      },
    });
    return parsePageResultState<LiangcangBoundWarehousePageItem>(resp);
  }

  /**
   * 应用关联设备分页（粮仓管理关联设备页设备表）。
   * GET `/liangcang/warehouse-management/application-devices/page`
   * 查询参数：`pageNumber`、`pageSize`，可选 `productIds`、`areaIds`、`deviceName`。
   */
  public async getApplicationDevicesPage(payload: {
    pageNumber: number;
    pageSize: number;
    productIds?: string[];
    areaIds?: string[];
    deviceName?: string;
  }): Promise<PageResultState<LiangcangApplicationDevicePageItem>> {
    const url = `${liangcangWarehouseBaseURL}/application-devices/page`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: {
        pageNumber: payload.pageNumber,
        pageSize: payload.pageSize,
        ...(payload.productIds != null && payload.productIds.length > 0 ? { productIds: payload.productIds } : {}),
        ...(payload.areaIds != null && payload.areaIds.length > 0 ? { areaIds: payload.areaIds } : {}),
        ...(payload.deviceName != null && payload.deviceName !== "" ? { deviceName: payload.deviceName } : {}),
      },
    });
    return parseApplicationDevicesPageResponse(resp);
  }

  public async getDeviceProductOptions(): Promise<LiangcangDeviceProductOption[]> {
    const url = `${BASE_API}/device-center/things/product/list/all`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    const data = unwrapGatewayData(resp);
    const records = Array.isArray(data)
      ? data
      : data != null && typeof data === "object" && Array.isArray((data as { records?: unknown[] }).records)
        ? (data as { records: unknown[] }).records
        : [];
    const options: LiangcangDeviceProductOption[] = [];
    for (const item of records) {
      if (item == null || typeof item !== "object") {
        continue;
      }
      const row = item as Record<string, unknown>;
      const id = getIdText(row.id, row.prodId, row.productId);
      const name = getText(row.prodName, row.name);
      if (id !== "" && name !== "") {
        options.push({ id, name });
      }
    }
    return options;
  }

  public async getAreaTree(): Promise<LiangcangAreaTreeItem[]> {
    const url = `${BASE_API}/mdata/area/list`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return mapAreaTree(unwrapGatewayData(resp));
  }

  /**
   * 粮仓绑定详情：三方 warehouseInfo + 本地雷达与业务设备绑定。
   * GET `/liangcang/warehouse-management/detail`，Query：`warehouseId`（RadarBindingDetailParam）
   */
  public async getRadarBindingDetail(warehouseId: number): Promise<LiangcangRadarBindingDetailVO | null> {
    const url = `${liangcangWarehouseBaseURL}/detail`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: { warehouseId },
    });
    return parseRadarBindingDetailResponse(resp);
  }

  /**
   * 雷达监测看板聚合数据。
   * GET `/liangcang/warehouse-management/radar-monitoring/dashboard`
   */
  public async getRadarMonitoringDashboard(): Promise<LiangcangRadarMonitoringDashboardVO> {
    const url = `${liangcangWarehouseBaseURL}/radar-monitoring/dashboard`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return parseRadarMonitoringDashboardResponse(resp);
  }

  /**
   * 雷达监测看板顶部统计数据。
   * GET `/liangcang/warehouse-management/radar-monitoring/summary`
   */
  public async getRadarMonitoringSummary(): Promise<LiangcangRadarMonitoringSummaryVO> {
    const url = `${liangcangWarehouseBaseURL}/radar-monitoring/summary`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return parseRadarMonitoringSummaryResponse(resp);
  }

  /**
   * 雷达监测看板仓房卡片列表。
   * GET `/liangcang/warehouse-management/radar-monitoring/warehouses`
   */
  public async getRadarMonitoringWarehouses(): Promise<LiangcangRadarMonitoringDashboardVO["warehouses"]> {
    const url = `${liangcangWarehouseBaseURL}/radar-monitoring/warehouses`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return parseRadarMonitoringWarehousesResponse(resp);
  }

  /**
   * 雷达监测看板最近告警（默认 5 条）。
   * GET `/liangcang/warehouse-management/radar-monitoring/alarms`
   */
  public async getRadarMonitoringAlarms(): Promise<LiangcangRadarMonitoringAlarmVO[]> {
    const url = `${liangcangWarehouseBaseURL}/radar-monitoring/alarms`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return parseRadarMonitoringAlarmResponse(resp);
  }

  /** 气体监测看板聚合数据。 */
  public async getGasMonitoringDashboard(): Promise<LiangcangGasMonitoringDashboardVO> {
    const url = `${liangcangWarehouseBaseURL}/gas-monitoring/dashboard`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return parseGasMonitoringDashboardResponse(resp);
  }

  /** 气体监测看板顶部统计数据。 */
  public async getGasMonitoringSummary(): Promise<LiangcangGasMonitoringSummaryVO> {
    const url = `${liangcangWarehouseBaseURL}/gas-monitoring/summary`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return parseGasMonitoringSummaryResponse(resp);
  }

  /** 气体监测看板仓房卡片列表。 */
  public async getGasMonitoringWarehouses(): Promise<LiangcangGasMonitoringDashboardVO["warehouses"]> {
    const url = `${liangcangWarehouseBaseURL}/gas-monitoring/warehouses`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return parseGasMonitoringWarehousesResponse(resp);
  }

  /** 气体监测看板最近告警事件（默认 5 条）。 */
  public async getGasMonitoringAlarms(): Promise<LiangcangGasMonitoringAlarmVO[]> {
    const url = `${liangcangWarehouseBaseURL}/gas-monitoring/alarms`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return parseGasMonitoringAlarmResponse(resp);
  }

  /** 温湿度监测看板聚合数据。 */
  public async getTemperatureHumidityMonitoringDashboard(): Promise<LiangcangTemperatureHumidityMonitoringDashboardVO> {
    const url = `${liangcangWarehouseBaseURL}/temperature-humidity-monitoring/dashboard`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return parseTemperatureHumidityMonitoringDashboardResponse(resp);
  }

  /** 温湿度监测看板顶部统计数据。 */
  public async getTemperatureHumidityMonitoringSummary(): Promise<LiangcangTemperatureHumidityMonitoringSummaryVO> {
    const url = `${liangcangWarehouseBaseURL}/temperature-humidity-monitoring/summary`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return parseTemperatureHumidityMonitoringSummaryResponse(resp);
  }

  /** 温湿度监测看板仓房卡片列表。 */
  public async getTemperatureHumidityMonitoringWarehouses(): Promise<LiangcangTemperatureHumidityMonitoringDashboardVO["warehouses"]> {
    const url = `${liangcangWarehouseBaseURL}/temperature-humidity-monitoring/warehouses`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return parseTemperatureHumidityMonitoringWarehousesResponse(resp);
  }

  /** 温湿度监测看板告警与温度预警（默认 5 条）。 */
  public async getTemperatureHumidityMonitoringAlerts(): Promise<LiangcangTemperatureHumidityMonitoringAlertVO> {
    const url = `${liangcangWarehouseBaseURL}/temperature-humidity-monitoring/alerts`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url });
    return parseTemperatureHumidityMonitoringAlertsResponse(resp);
  }

  /**
   * 仓库已绑定业务设备分页（仓房维度）。
   * GET `/liangcang/warehouse-management/bound-devices/page`
   * Query：`warehouseId`、`pageNumber`、`pageSize`，可选 `productIds`、`areaIds`、`deviceName`
   */
  public async getBoundWarehouseDevicesPage(payload: {
    warehouseId: number;
    pageNumber: number;
    pageSize: number;
    productIds?: string[];
    areaIds?: string[];
    deviceName?: string;
  }): Promise<PageResultState<LiangcangBoundWarehouseDevicePageItem>> {
    const url = `${liangcangWarehouseBaseURL}/bound-devices/page`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: {
        warehouseId: payload.warehouseId,
        pageNumber: payload.pageNumber,
        pageSize: payload.pageSize,
        ...(payload.productIds != null && payload.productIds.length > 0 ? { productIds: payload.productIds } : {}),
        ...(payload.areaIds != null && payload.areaIds.length > 0 ? { areaIds: payload.areaIds } : {}),
        ...(payload.deviceName != null && payload.deviceName !== "" ? { deviceName: payload.deviceName } : {}),
      },
    });
    return parsePageResultState<LiangcangBoundWarehouseDevicePageItem>(resp);
  }

  /**
   * 粮仓位置卡片信息（大屏/详情卡片数据聚合）。
   * GET `/liangcang/warehouse-management/location-card/info`，Query：`warehouseId`
   */
  public async getWarehouseLocationCardInfo(warehouseId: number): Promise<LiangcangWarehouseLocationCardInfoVO | null> {
    const url = `${liangcangWarehouseBaseURL}/location-card/info`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: { warehouseId },
    });
    return parseLocationCardInfoResponse(resp);
  }

  /** 货位卡配置：已绑定粮仓分页。 */
  public async getLocationCardBoundWarehousePage(
    payload: WarehouseLocationCardBoundWarehousePageParam,
  ): Promise<PageResultState<WarehouseLocationCardBoundWarehousePageItem>> {
    const url = `${locationCardConfigBaseURL}/bound-warehouse/page`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload: {
        pageNumber: payload.pageNumber,
        pageSize: payload.pageSize,
        ...(payload.warehouseName != null && payload.warehouseName.trim() !== "" ? { warehouseName: payload.warehouseName.trim() } : {}),
      },
    });
    return parsePageResultState<WarehouseLocationCardBoundWarehousePageItem>(resp);
  }

  /** 货位卡配置详情。 */
  public async getLocationCardConfigDetail(warehouseId: number): Promise<WarehouseLocationCardConfigDetailVO | null> {
    const url = `${locationCardConfigBaseURL}/config/detail`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload: { warehouseId },
    });
    const data = unwrapGatewayData(resp);
    if (data == null || typeof data !== "object" || Array.isArray(data)) {
      return null;
    }
    return data as WarehouseLocationCardConfigDetailVO;
  }

  /** 保存货位卡仓位档案。 */
  public async saveLocationCardPositionProfile(payload: WarehouseLocationCardPositionProfileSaveParam): Promise<boolean> {
    const url = `${locationCardConfigBaseURL}/position-profile/save`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload: { ...payload },
    });
    return parseBooleanResponse(resp);
  }

  /** 新增质量检测记录。 */
  public async createLocationCardQualityInspection(payload: WarehouseLocationCardQualityInspectionSaveParam): Promise<boolean> {
    const url = `${locationCardConfigBaseURL}/quality-inspection/create`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload: { ...payload },
    });
    return parseBooleanResponse(resp);
  }

  /** 编辑质量检测记录。 */
  public async updateLocationCardQualityInspection(payload: WarehouseLocationCardQualityInspectionSaveParam): Promise<boolean> {
    const url = `${locationCardConfigBaseURL}/quality-inspection/update`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload: { ...payload },
    });
    return parseBooleanResponse(resp);
  }

  /** 删除质量检测记录。 */
  public async deleteLocationCardQualityInspection(id: number | string): Promise<boolean> {
    const url = `${locationCardConfigBaseURL}/quality-inspection/delete`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload: { id },
    });
    return parseBooleanResponse(resp);
  }

  /** 货位卡字段变更记录。 */
  public async getLocationCardChangeLogList(payload: {
    warehouseId: number;
    pageNumber: number;
    pageSize: number;
    bizType?: string;
  }): Promise<PageResultState<WarehouseLocationCardFieldChangeLogVO>> {
    const url = `${locationCardConfigBaseURL}/change-log/list`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload: {
        warehouseId: payload.warehouseId,
        pageNumber: payload.pageNumber,
        pageSize: payload.pageSize,
        ...(payload.bizType != null && payload.bizType !== "" ? { bizType: payload.bizType } : {}),
      },
    });
    return parsePageResultState<WarehouseLocationCardFieldChangeLogVO>(resp);
  }

  /**
   * 粮仓业务设备解绑。
   * POST `/liangcang/warehouse-management/unbind`，JSON body：`WarehouseUnbindParam`
   */
  public async unbindWarehouse(payload: LiangcangWarehouseUnbindPayload): Promise<boolean> {
    const url = `${liangcangWarehouseBaseURL}/unbind`;
    const body: Record<string, unknown> = {
      warehouseId: payload.warehouseId,
    };
    if (Array.isArray(payload.deviceIds) && payload.deviceIds.length > 0) {
      body.deviceIds = payload.deviceIds;
    }
    if (payload.selectAllDevices === true) {
      body.selectAllDevices = true;
    }
    if (payload.selectAllDevices === true && payload.productIds != null && payload.productIds.length > 0) {
      body.productIds = payload.productIds;
    }
    if (payload.selectAllDevices === true && payload.areaIds != null && payload.areaIds.length > 0) {
      body.areaIds = payload.areaIds;
    }
    if (payload.selectAllDevices === true && payload.deviceName != null && payload.deviceName.trim() !== "") {
      body.deviceName = payload.deviceName.trim();
    }
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload: body,
    });
    return parseBooleanResponse(resp);
  }

  /**
   * 雷达与业务设备绑定（粮仓维度）。
   * POST `/liangcang/warehouse-management/bind`，body：`warehouseId`、`radarDeviceId`、`deviceIds`。
   * `selectAllDevices` 为 true 时，按 `productIds`、`areaIds`、`deviceName` 绑定当前查询下全部可关联设备。
   * 成功时响应体为 `true`（经网关时可能包在 `data` 内）。
   */
  public async bindWarehouseRadar(payload: LiangcangWarehouseRadarBindPayload): Promise<boolean> {
    const url = `${liangcangWarehouseBaseURL}/bind`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload: {
        warehouseId: payload.warehouseId,
        radarDeviceId: payload.radarDeviceId,
        deviceIds: payload.deviceIds,
        selectAllDevices: payload.selectAllDevices,
        productIds: payload.productIds,
        areaIds: payload.areaIds,
        deviceName: payload.deviceName,
      },
    });
    return parseBooleanResponse(resp);
  }

  /** 部门列表（OUAA：`/ouaa/organizations`） */
  public async getDeptList(payload: { enabled?: boolean; name?: string } = {}): Promise<OuaaDepartmentItem[]> {
    const url = `${BASE_API}/ouaa/organizations`;
    const resp = await this.gateway.get<LegacyServiceError<OuaaDepartmentItem[]>>({
      url,
      payload: {
        enabled: payload.enabled ?? true,
        ...(payload.name != null && payload.name !== "" ? { name: payload.name } : {}),
      },
    });
    return resp.data || resp || [];
  }

  /** 部门下用户列表（OUAA：`/ouaa/tenant/user/list`） */
  public async getStaffPage(payload: {
    keyword?: string;
    organizationId?: string;
    enabled?: boolean;
  }): Promise<{ records: OuaaStaffItem[]; total: number; pages: number }> {
    const url = `${BASE_API}/ouaa/tenant/user/list`;
    const resp = await this.gateway.get<LegacyServiceError<OuaaStaffItem[]>>({
      url,
      payload: {
        enabled: payload.enabled ?? true,
        ...(payload.keyword != null && payload.keyword !== "" ? { keyword: payload.keyword } : {}),
        ...(payload.organizationId != null && payload.organizationId !== "" ? { organizationIds: [payload.organizationId] } : {}),
      },
    });
    const records = resp.data || resp || [];
    return { records, total: records.length, pages: 1 };
  }

  /** 按用户名称搜索（POST `/ouaa/tenant/user/list`） */
  public async postUserList(payload: {
    keyword?: string;
    organizationIds?: string[];
    roleIds?: string[];
    enabled?: boolean;
  }): Promise<OuaaStaffItem[]> {
    const url = `${BASE_API}/ouaa/tenant/user/list`;
    const resp = await this.gateway.custom<LegacyServiceError<OuaaStaffItem[]>>({
      method: "POST",
      url,
      payload: {
        enabled: payload.enabled ?? true,
        ...(payload.keyword != null && payload.keyword !== "" ? { keyword: payload.keyword } : {}),
        ...(Array.isArray(payload.organizationIds) && payload.organizationIds.length > 0
          ? { organizationIds: payload.organizationIds }
          : {}),
        ...(Array.isArray(payload.roleIds) && payload.roleIds.length > 0 ? { roleIds: payload.roleIds } : {}),
      },
    });
    return resp.data || resp || [];
  }

  /** 角色列表（OUAA：`/ouaa/roles`） */
  public async getRoleList(payload: { enabled?: boolean; keyword?: string } = {}): Promise<OuaaRoleItem[]> {
    const url = `${BASE_API}/ouaa/roles`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: {
        enabled: payload.enabled ?? true,
        ...(payload.keyword != null && payload.keyword !== "" ? { keyword: payload.keyword } : {}),
      },
    });
    const body = (resp as { data?: unknown }).data ?? resp;
    if (Array.isArray(body)) {
      return body as OuaaRoleItem[];
    }
    if (body != null && typeof body === "object") {
      const records = (body as { records?: unknown }).records;
      if (Array.isArray(records)) {
        return records as OuaaRoleItem[];
      }
    }
    return [];
  }

  /**
   * 查询粮仓已绑定人员（GET `/liangcang/warehouse-permission/bindings`，Query：`warehouseId`）
   * 响应 Apifox：`WarehousePersonPermissionListVO`（`personIds`）
   */
  public async getWarehousePermissionBindings(warehouseId: number): Promise<string[]> {
    const url = `${BASE_API}/${CHANGSHA_XIALING_PREFIX}/liangcang/warehouse-permission/bindings`;
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload: { warehouseId },
    });
    return parseWarehousePersonPermissionList(resp);
  }

  /**
   * 更新粮仓绑定人员（POST `/liangcang/warehouse-permission/bindings`）
   * 请求体 Apifox：`WarehousePersonPermissionUpdateParam`（`warehouseId`、`personIds` 整体替换）
   */
  public async bindWarehousePermissionBindings(payload: LiangcangWarehousePermissionBindingPayload): Promise<boolean> {
    const url = `${BASE_API}/${CHANGSHA_XIALING_PREFIX}/liangcang/warehouse-permission/bindings`;
    const resp = await this.gateway.custom<LegacyServiceError<unknown>>({
      method: "POST",
      url,
      payload: {
        warehouseId: payload.warehouseId,
        personIds: payload.personIds,
      },
    });
    /** Apifox：200 体可为 `{}`（非 boolean）；仅显式 false 视为失败 */
    const v = unwrapGatewayData(resp);
    if (v === false || v === "false") {
      return false;
    }
    if (typeof v === "string" && v.trim().toLowerCase() === "false") {
      return false;
    }
    if (v === true || v === "true") {
      return true;
    }
    if (typeof v === "string" && v.trim().toLowerCase() === "true") {
      return true;
    }
    /** Apifox：成功时 200 body 常为无字段的 `{}`，不能按 boolean 解析成 false */
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      const keys = Object.keys(v as object);
      return keys.length === 0 ? true : parseBooleanResponse(resp);
    }
    return parseBooleanResponse(resp);
  }
}
