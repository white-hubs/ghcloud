import type { PageResultState } from "@ghcloud/cube-protocol";

import type {
  LiangcangAcquisitionItem,
  LiangcangAcquisitionTurnoverItem,
  LiangcangApplicationDevicePageItem,
  LiangcangBoundWarehouseSimpleItem,
  LiangcangDeviceStatusCountVO,
  LiangcangRadarBindingDetailVO,
  LiangcangRadarMonitoringSummaryVO,
  LiangcangRadarMonitoringAlarmVO,
  LiangcangRadarMonitoringDashboardVO,
  LiangcangRadarMonitoringWarehouseVO,
  LiangcangGasMonitoringSummaryVO,
  LiangcangGasMonitoringAlarmVO,
  LiangcangGasMonitoringDashboardVO,
  LiangcangGasMonitoringWarehouseVO,
  LiangcangTemperatureHumidityMonitoringAlertVO,
  LiangcangTemperatureHumidityMonitoringAlarmVO,
  LiangcangTemperatureHumidityMonitoringDashboardVO,
  LiangcangTemperatureHumidityMonitoringWarningVO,
  LiangcangTemperatureHumidityMonitoringWarehouseVO,
  LiangcangTemperatureHumidityMonitoringSummaryVO,
  LiangcangTimeDimensionTrendItem,
  LiangcangTimeDimensionTurnoverItem,
  LiangcangWarehouseLocationCardInfoVO,
  LiangcangWarehouseStatisticsRow,
  LiangcangWarehouseStatisticsVO,
  LiangcangWarehouseTemperatureTrendCard,
  LiangcangWarehouseTemperatureTrendChart,
  LiangcangWarehouseTemperatureTrendPoint,
  LiangcangTemperatureTrendScope,
  LiangcangWarehouseTemperatureTrendStatisticsVO,
} from "./types";

type Envelope = { data?: PageResultState<LiangcangApplicationDevicePageItem> };

export const parseApplicationDevicesPageResponse = (raw: unknown): PageResultState<LiangcangApplicationDevicePageItem> => {
  const v = raw as Envelope | PageResultState<LiangcangApplicationDevicePageItem>;
  if (v != null && typeof v === "object" && "data" in v && (v as Envelope).data != null) {
    return (v as Envelope).data as PageResultState<LiangcangApplicationDevicePageItem>;
  }
  return v as PageResultState<LiangcangApplicationDevicePageItem>;
};

const MAX_DATA_PEEL = 5;

/** 网关或多层统一封装 `{ data }` 时逐层剥到内层载荷 */
export const unwrapGatewayData = (raw: unknown): unknown => {
  let v: unknown = raw;
  for (let d = 0; d < MAX_DATA_PEEL; d += 1) {
    if (v != null && typeof v === "object" && !Array.isArray(v) && "data" in (v as Record<string, unknown>)) {
      const next = (v as { data: unknown }).data;
      if (next === undefined) {
        break;
      }
      v = next;
    } else {
      break;
    }
  }
  return v;
};

/**
 * GET `/liangcang/warehouse-permission/bindings`（`WarehousePersonPermissionListVO`）
 * 内层 `data` 有时为 JSON 字符串；`personIds` 常为 string[]（int64）或 number[]。
 */
export const parseWarehousePersonPermissionList = (raw: unknown): string[] => {
  let v: unknown = unwrapGatewayData(raw);
  if (typeof v === "string") {
    const text = v.trim();
    if (text === "" || text === "null") {
      return [];
    }
    try {
      v = JSON.parse(text) as unknown;
    } catch {
      return [];
    }
    v = unwrapGatewayData(v);
  }
  if (v != null && typeof v === "object" && !Array.isArray(v)) {
    const personIds = (v as { personIds?: unknown }).personIds;
    if (Array.isArray(personIds)) {
      return personIds.map((id) => String(id).trim()).filter((id) => id !== "");
    }
  }
  return [];
};

/** 响应为 JSON 数组（或包在多层 data 内） */
export const parseJsonArray = <T>(raw: unknown): T[] => {
  const v = unwrapGatewayData(raw);
  return Array.isArray(v) ? (v as T[]) : [];
};

const readDashboardNumber = (source: Record<string, unknown>, ...keys: string[]): number | null => {
  for (const key of keys) {
    const value = toNullableFiniteNumber(source[key]);
    if (value != null) {
      return value;
    }
  }
  return null;
};

const readDashboardText = (source: Record<string, unknown>, ...keys: string[]): string => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return "";
};

const readDashboardBoolean = (source: Record<string, unknown>, ...keys: string[]): boolean | null => {
  for (const key of keys) {
    const value = source[key];
    if (value === true || value === false) {
      return value;
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["online", "true", "1"].includes(normalized)) {
        return true;
      }
      if (["offline", "false", "0"].includes(normalized)) {
        return false;
      }
    }
    if (typeof value === "number" && (value === 1 || value === 0)) {
      return value === 1;
    }
  }
  return null;
};

const readDashboardRows = (source: Record<string, unknown>, ...keys: string[]): unknown[] => {
  for (const key of keys) {
    if (Array.isArray(source[key])) {
      return source[key] as unknown[];
    }
  }
  return [];
};

const parseRadarMonitoringWarehouse = (raw: unknown): LiangcangRadarMonitoringWarehouseVO | null => {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const row = raw as Record<string, unknown>;
  const warehouseId = readDashboardText(row, "warehouseId", "id");
  if (warehouseId === "") {
    return null;
  }
  return {
    warehouseId,
    warehouseName: readDashboardText(row, "warehouseName", "granaryName", "name") || "未命名仓房",
    currentWeight: readDashboardNumber(row, "currentWeight", "weight", "materialWeight"),
    currentVolume: readDashboardNumber(row, "currentVolume", "volume", "materialVolume"),
    weightWarningValue: readDashboardNumber(row, "weightWarningValue", "weightThreshold", "weightWarningThreshold"),
    volumeWarningValue: readDashboardNumber(row, "volumeWarningValue", "volumeThreshold", "volumeWarningThreshold"),
    online: readDashboardBoolean(row, "online", "deviceOnline", "radarOnline", "status"),
    latestReportTime: readDashboardText(row, "latestReportTime", "lastReportTime", "lastUploadTime", "reportTime"),
    alarm: readDashboardBoolean(row, "alarm", "hasAlarm", "warning") === true,
    alarmMessage: readDashboardText(row, "alarmMessage", "warningMessage", "message"),
  };
};

const parseRadarMonitoringAlarm = (raw: unknown, index: number): LiangcangRadarMonitoringAlarmVO | null => {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const row = raw as Record<string, unknown>;
  return {
    id: readDashboardText(row, "id", "alarmId") || `alarm-${index}`,
    content: readDashboardText(row, "content", "alarmContent", "message", "description"),
    level: readDashboardText(row, "level", "alarmLevel", "severity"),
    warehouseName: readDashboardText(row, "warehouseName", "granaryName", "areaName"),
    warehouseId: readDashboardText(row, "warehouseId"),
    alarmArea: readDashboardText(row, "alarmArea", "areaName", "area"),
    alarmTime: readDashboardText(row, "alarmTime", "occurTime", "createdAt", "time"),
  };
};

const parseRadarMonitoringSummary = (source: Record<string, unknown>): LiangcangRadarMonitoringSummaryVO => {
  const onlineDeviceCount = readDashboardNumber(source, "onlineDeviceCount", "onlineCount") ?? 0;
  const offlineDeviceCount = readDashboardNumber(source, "offlineDeviceCount", "offlineCount") ?? 0;
  return {
    totalDeviceCount:
      readDashboardNumber(source, "totalDeviceCount", "deviceCount", "totalCount") ?? onlineDeviceCount + offlineDeviceCount,
    onlineDeviceCount,
    offlineDeviceCount,
    alarmWarehouseCount: readDashboardNumber(source, "alarmWarehouseCount", "warningWarehouseCount") ?? 0,
    alarmCount: readDashboardNumber(source, "alarmCount", "totalAlarmCount", "alarmTotal") ?? 0,
  };
};

export const parseRadarMonitoringSummaryResponse = (raw: unknown): LiangcangRadarMonitoringSummaryVO => {
  const v = unwrapGatewayData(raw);
  if (v == null || typeof v !== "object" || Array.isArray(v)) {
    return { totalDeviceCount: 0, onlineDeviceCount: 0, offlineDeviceCount: 0, alarmWarehouseCount: 0, alarmCount: 0 };
  }
  const root = v as Record<string, unknown>;
  const summaryPayload = root.summary ?? root.statistics ?? root.overview;
  return parseRadarMonitoringSummary(
    summaryPayload != null && typeof summaryPayload === "object" && !Array.isArray(summaryPayload)
      ? (summaryPayload as Record<string, unknown>)
      : root,
  );
};

export const parseRadarMonitoringWarehousesResponse = (raw: unknown): LiangcangRadarMonitoringWarehouseVO[] => {
  const v = unwrapGatewayData(raw);
  if (Array.isArray(v)) {
    return v.map(parseRadarMonitoringWarehouse).filter((item): item is LiangcangRadarMonitoringWarehouseVO => item != null);
  }
  if (v == null || typeof v !== "object" || Array.isArray(v)) {
    return [];
  }
  return readDashboardRows(v as Record<string, unknown>, "warehouses", "warehouseList", "items")
    .map(parseRadarMonitoringWarehouse)
    .filter((item): item is LiangcangRadarMonitoringWarehouseVO => item != null);
};

export const parseRadarMonitoringAlarmResponse = (raw: unknown): LiangcangRadarMonitoringAlarmVO[] => {
  const v = unwrapGatewayData(raw);
  if (Array.isArray(v)) {
    return v
      .map((row, index) => parseRadarMonitoringAlarm(row, index))
      .filter((item): item is LiangcangRadarMonitoringAlarmVO => item != null);
  }
  if (v == null || typeof v !== "object" || Array.isArray(v)) {
    return [];
  }
  return readDashboardRows(v as Record<string, unknown>, "recentAlarms", "alarms", "alarmList")
    .map((row, index) => parseRadarMonitoringAlarm(row, index))
    .filter((item): item is LiangcangRadarMonitoringAlarmVO => item != null);
};

/** GET `/liangcang/warehouse-management/radar-monitoring/dashboard`（或包在多层 `data` 内） */
export const parseRadarMonitoringDashboardResponse = (raw: unknown): LiangcangRadarMonitoringDashboardVO => {
  const v = unwrapGatewayData(raw);
  if (v == null || typeof v !== "object" || Array.isArray(v)) {
    return {
      summary: { totalDeviceCount: 0, onlineDeviceCount: 0, offlineDeviceCount: 0, alarmWarehouseCount: 0, alarmCount: 0 },
      warehouses: [],
      recentAlarms: [],
    };
  }
  const root = v as Record<string, unknown>;
  const summaryPayload = root.summary ?? root.statistics ?? root.overview;
  return {
    summary: parseRadarMonitoringSummary(
      summaryPayload != null && typeof summaryPayload === "object" && !Array.isArray(summaryPayload)
        ? (summaryPayload as Record<string, unknown>)
        : root,
    ),
    warehouses: parseRadarMonitoringWarehousesResponse(root),
    recentAlarms: parseRadarMonitoringAlarmResponse(root),
  };
};

const parseGasMonitoringWarehouse = (raw: unknown): LiangcangGasMonitoringWarehouseVO | null => {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  const warehouseId = readDashboardText(row, "warehouseId", "id");
  if (warehouseId === "") return null;
  return {
    warehouseId,
    warehouseName: readDashboardText(row, "warehouseName", "granaryName", "name") || "未命名仓房",
    co2: readDashboardNumber(row, "co2", "co2Ppm", "CO2", "gasCo2", "carbonDioxide"),
    o2: readDashboardNumber(row, "o2", "o2Percent", "O2", "gasO2", "oxygen"),
    ph3: readDashboardNumber(row, "ph3", "ph3Ppm", "PH3", "gasPh3", "phosphine", "phosphinePpm"),
    online: readDashboardBoolean(row, "online", "deviceOnline", "gasOnline", "status"),
    alarm: readDashboardBoolean(row, "alarm", "hasAlarm", "warning") === true,
    alarmMessage: readDashboardText(row, "alarmMessage", "warningMessage", "message"),
  };
};

const parseGasMonitoringAlarm = (raw: unknown, index: number): LiangcangGasMonitoringAlarmVO | null => {
  const alarm = parseRadarMonitoringAlarm(raw, index);
  return alarm == null ? null : alarm;
};

const parseGasMonitoringSummary = (source: Record<string, unknown>): LiangcangGasMonitoringSummaryVO => {
  return {
    totalDeviceCount: readDashboardNumber(source, "totalDeviceCount", "deviceCount", "totalCount") ?? 0,
    onlineDeviceCount: readDashboardNumber(source, "onlineDeviceCount", "onlineCount") ?? 0,
    offlineDeviceCount: readDashboardNumber(source, "offlineDeviceCount", "offlineCount") ?? 0,
    alarmWarehouseCount: readDashboardNumber(source, "alarmWarehouseCount", "warningWarehouseCount") ?? 0,
    alarmCount: readDashboardNumber(source, "alarmCount", "totalAlarmCount", "alarmTotal") ?? 0,
  };
};

export const parseGasMonitoringSummaryResponse = (raw: unknown): LiangcangGasMonitoringSummaryVO => {
  const v = unwrapGatewayData(raw);
  if (v == null || typeof v !== "object" || Array.isArray(v)) {
    return { totalDeviceCount: 0, onlineDeviceCount: 0, offlineDeviceCount: 0, alarmWarehouseCount: 0, alarmCount: 0 };
  }
  const root = v as Record<string, unknown>;
  const summaryPayload = root.summary ?? root.statistics ?? root.overview;
  return parseGasMonitoringSummary(
    summaryPayload != null && typeof summaryPayload === "object" && !Array.isArray(summaryPayload)
      ? (summaryPayload as Record<string, unknown>)
      : root,
  );
};

export const parseGasMonitoringWarehousesResponse = (raw: unknown): LiangcangGasMonitoringWarehouseVO[] => {
  const v = unwrapGatewayData(raw);
  if (Array.isArray(v)) {
    return v.map(parseGasMonitoringWarehouse).filter((item): item is LiangcangGasMonitoringWarehouseVO => item != null);
  }
  if (v == null || typeof v !== "object" || Array.isArray(v)) {
    return [];
  }
  return readDashboardRows(v as Record<string, unknown>, "warehouses", "warehouseList", "items")
    .map(parseGasMonitoringWarehouse)
    .filter((item): item is LiangcangGasMonitoringWarehouseVO => item != null);
};

export const parseGasMonitoringAlarmResponse = (raw: unknown): LiangcangGasMonitoringAlarmVO[] => {
  const v = unwrapGatewayData(raw);
  if (Array.isArray(v)) {
    return v.map((row, index) => parseGasMonitoringAlarm(row, index)).filter((item): item is LiangcangGasMonitoringAlarmVO => item != null);
  }
  if (v == null || typeof v !== "object" || Array.isArray(v)) {
    return [];
  }
  return readDashboardRows(v as Record<string, unknown>, "recentAlarms", "alarms", "alarmList")
    .map((row, index) => parseGasMonitoringAlarm(row, index))
    .filter((item): item is LiangcangGasMonitoringAlarmVO => item != null);
};

/** GET `/liangcang/warehouse-management/gas-monitoring/dashboard` */
export const parseGasMonitoringDashboardResponse = (raw: unknown): LiangcangGasMonitoringDashboardVO => {
  const v = unwrapGatewayData(raw);
  if (v == null || typeof v !== "object" || Array.isArray(v)) {
    return {
      summary: { totalDeviceCount: 0, onlineDeviceCount: 0, offlineDeviceCount: 0, alarmWarehouseCount: 0, alarmCount: 0 },
      warehouses: [],
      recentAlarms: [],
    };
  }
  const root = v as Record<string, unknown>;
  return {
    summary: parseGasMonitoringSummary(
      (() => {
        const summaryPayload = root.summary ?? root.statistics ?? root.overview;
        return summaryPayload != null && typeof summaryPayload === "object" && !Array.isArray(summaryPayload)
          ? (summaryPayload as Record<string, unknown>)
          : root;
      })(),
    ),
    warehouses: parseGasMonitoringWarehousesResponse(v),
    recentAlarms: parseGasMonitoringAlarmResponse(v),
  };
};

const parseTemperatureHumidityMonitoringWarehouse = (raw: unknown): LiangcangTemperatureHumidityMonitoringWarehouseVO | null => {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const row = raw as Record<string, unknown>;
  const warehouseId = readDashboardText(row, "warehouseId", "id");
  if (warehouseId === "") {
    return null;
  }
  return {
    warehouseId,
    warehouseName: readDashboardText(row, "warehouseName", "granaryName", "name") || "未命名仓房",
    onlineDeviceCount: readDashboardNumber(row, "onlineDeviceCount", "onlineCount") ?? 0,
    offlineDeviceCount: readDashboardNumber(row, "offlineDeviceCount", "offlineCount") ?? 0,
    online: readDashboardBoolean(row, "online", "deviceOnline", "temperatureHumidityOnline", "status"),
    maxTemperature: readDashboardNumber(row, "maxTemperature", "temperatureMax", "maxTemp"),
    minTemperature: readDashboardNumber(row, "minTemperature", "temperatureMin", "minTemp"),
    avgTemperature: readDashboardNumber(row, "avgTemperature", "averageTemperature", "temperatureAvg", "avgTemp"),
    humidity: readDashboardNumber(row, "humidity", "avgHumidity", "averageHumidity"),
    alarm: readDashboardBoolean(row, "alarm", "hasAlarm") === true,
    warning: readDashboardBoolean(row, "warning", "hasWarning", "temperatureWarning") === true,
  };
};

const parseTemperatureHumidityMonitoringWarning = (raw: unknown, index: number): LiangcangTemperatureHumidityMonitoringWarningVO | null => {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const row = raw as Record<string, unknown>;
  return {
    id: readDashboardText(row, "id", "warningId", "alertId") || `temperature-warning-${index}`,
    warehouseId: readDashboardText(row, "warehouseId"),
    warehouseName: readDashboardText(row, "warehouseName", "granaryName", "areaName"),
    content: readDashboardText(row, "content", "warningContent", "message", "description"),
    currentAvgTemperature: readDashboardNumber(row, "currentAvgTemperature", "avgTemperature", "currentTemperature", "temperature"),
    warningThreshold: readDashboardNumber(row, "warningThreshold", "threshold", "temperatureThreshold"),
    distanceToThreshold: readDashboardNumber(row, "distanceToThreshold"),
    dailyIncrease: readDashboardNumber(row, "dailyIncrease", "dailyTemperatureIncrease", "increase"),
    consecutiveDays: readDashboardNumber(row, "consecutiveDays", "continuousDays", "durationDays"),
    triggeredAt: readDashboardText(row, "triggeredAt", "warningTime", "occurTime", "createdAt", "time"),
    status: readDashboardText(row, "status", "warningStatus"),
  };
};

/** GET `/liangcang/warehouse-management/temperature-humidity-monitoring/dashboard` */
export const parseTemperatureHumidityMonitoringDashboardResponse = (raw: unknown): LiangcangTemperatureHumidityMonitoringDashboardVO => {
  const empty: LiangcangTemperatureHumidityMonitoringDashboardVO = {
    summary: {
      totalDeviceCount: 0,
      onlineDeviceCount: 0,
      offlineDeviceCount: 0,
      warningWarehouseCount: 0,
      alarmWarehouseCount: 0,
      alarmCount: 0,
      warningCount: 0,
    },
    warehouses: [],
    recentAlarms: [],
    recentTemperatureWarnings: [],
  };
  const value = unwrapGatewayData(raw);
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return empty;
  }
  const root = value as Record<string, unknown>;
  const summaryRaw = root.summary ?? root.statistics ?? root.overview;
  const summary =
    summaryRaw != null && typeof summaryRaw === "object" && !Array.isArray(summaryRaw) ? (summaryRaw as Record<string, unknown>) : root;
  const warehouses = readDashboardRows(root, "warehouses", "warehouseList", "items")
    .map(parseTemperatureHumidityMonitoringWarehouse)
    .filter((item): item is LiangcangTemperatureHumidityMonitoringWarehouseVO => item != null);
  const recentAlarms = readDashboardRows(root, "recentAlarms", "alarms", "alarmList")
    .map(parseRadarMonitoringAlarm)
    .filter((item): item is LiangcangTemperatureHumidityMonitoringAlarmVO => item != null);
  const recentTemperatureWarnings = readDashboardRows(root, "recentTemperatureWarnings", "temperatureWarnings", "warningList")
    .map(parseTemperatureHumidityMonitoringWarning)
    .filter((item): item is LiangcangTemperatureHumidityMonitoringWarningVO => item != null);
  const onlineDeviceCount = readDashboardNumber(summary, "onlineDeviceCount", "onlineCount") ?? 0;
  const offlineDeviceCount = readDashboardNumber(summary, "offlineDeviceCount", "offlineCount") ?? 0;
  return {
    summary: {
      totalDeviceCount:
        readDashboardNumber(summary, "totalDeviceCount", "deviceCount", "totalCount") ?? onlineDeviceCount + offlineDeviceCount,
      onlineDeviceCount,
      offlineDeviceCount,
      warningWarehouseCount: readDashboardNumber(summary, "warningWarehouseCount") ?? warehouses.filter((item) => item.warning).length,
      alarmWarehouseCount: readDashboardNumber(summary, "alarmWarehouseCount") ?? warehouses.filter((item) => item.alarm).length,
      alarmCount: readDashboardNumber(summary, "alarmCount", "totalAlarmCount", "alarmTotal") ?? recentAlarms.length,
      warningCount: readDashboardNumber(summary, "warningCount", "totalWarningCount", "warningTotal") ?? recentTemperatureWarnings.length,
    },
    warehouses,
    recentAlarms,
    recentTemperatureWarnings,
  };
};

export const parseTemperatureHumidityMonitoringSummaryResponse = (raw: unknown): LiangcangTemperatureHumidityMonitoringSummaryVO => {
  const v = unwrapGatewayData(raw);
  if (v == null || typeof v !== "object" || Array.isArray(v)) {
    return {
      totalDeviceCount: 0,
      onlineDeviceCount: 0,
      offlineDeviceCount: 0,
      warningWarehouseCount: 0,
      alarmWarehouseCount: 0,
      alarmCount: 0,
      warningCount: 0,
    };
  }
  const root = v as Record<string, unknown>;
  const summary =
    (root.summary ?? root.statistics ?? root.overview) != null &&
    typeof (root.summary ?? root.statistics ?? root.overview) === "object" &&
    !Array.isArray(root.summary ?? root.statistics ?? root.overview)
      ? ((root.summary ?? root.statistics ?? root.overview) as Record<string, unknown>)
      : root;
  return {
    totalDeviceCount:
      readDashboardNumber(summary, "totalDeviceCount", "deviceCount", "totalCount") ??
      (readDashboardNumber(summary, "onlineDeviceCount", "onlineCount") ?? 0) +
        (readDashboardNumber(summary, "offlineDeviceCount", "offlineCount") ?? 0),
    onlineDeviceCount: readDashboardNumber(summary, "onlineDeviceCount", "onlineCount") ?? 0,
    offlineDeviceCount: readDashboardNumber(summary, "offlineDeviceCount", "offlineCount") ?? 0,
    warningWarehouseCount: readDashboardNumber(summary, "warningWarehouseCount") ?? 0,
    alarmWarehouseCount: readDashboardNumber(summary, "alarmWarehouseCount") ?? 0,
    alarmCount: readDashboardNumber(summary, "alarmCount", "totalAlarmCount", "alarmTotal") ?? 0,
    warningCount: readDashboardNumber(summary, "warningCount", "totalWarningCount", "warningTotal") ?? 0,
  };
};

export const parseTemperatureHumidityMonitoringWarehousesResponse = (raw: unknown): LiangcangTemperatureHumidityMonitoringWarehouseVO[] => {
  const v = unwrapGatewayData(raw);
  if (Array.isArray(v)) {
    return v
      .map(parseTemperatureHumidityMonitoringWarehouse)
      .filter((item): item is LiangcangTemperatureHumidityMonitoringWarehouseVO => item != null);
  }
  if (v == null || typeof v !== "object" || Array.isArray(v)) {
    return [];
  }
  return readDashboardRows(v as Record<string, unknown>, "warehouses", "warehouseList", "items")
    .map(parseTemperatureHumidityMonitoringWarehouse)
    .filter((item): item is LiangcangTemperatureHumidityMonitoringWarehouseVO => item != null);
};

export const parseTemperatureHumidityMonitoringAlertsResponse = (raw: unknown): LiangcangTemperatureHumidityMonitoringAlertVO => {
  const empty: LiangcangTemperatureHumidityMonitoringAlertVO = {
    recentAlarms: [],
    recentTemperatureWarnings: [],
  };
  const v = unwrapGatewayData(raw);
  if (v == null || typeof v !== "object" || Array.isArray(v)) {
    return empty;
  }
  const root = v as Record<string, unknown>;
  return {
    recentAlarms: readDashboardRows(root, "recentAlarms", "alarms", "alarmList")
      .map((row, index) => parseTemperatureHumidityMonitoringAlarm(row, index))
      .filter((item): item is LiangcangTemperatureHumidityMonitoringAlarmVO => item != null),
    recentTemperatureWarnings: readDashboardRows(root, "recentTemperatureWarnings", "temperatureWarnings", "warningList")
      .map((row, index) => parseTemperatureHumidityMonitoringWarning(row, index))
      .filter((item): item is LiangcangTemperatureHumidityMonitoringWarningVO => item != null),
  };
};

const parseTemperatureHumidityMonitoringAlarm = (raw: unknown, index: number): LiangcangTemperatureHumidityMonitoringAlarmVO | null => {
  const alarm = parseRadarMonitoringAlarm(raw, index);
  return alarm == null ? null : (alarm as LiangcangTemperatureHumidityMonitoringAlarmVO);
};

/**
 * POST 返回 `Boolean`（Apifox：`/liangcang/warehouse-management/bind` 等 200 体为 `boolean`；
 * 经网关时可能包在多层 `data` 内）。
 * `CubeGateway` 对纯 JSON 字面量 `true`/`false` 会误解析为字符串，此处一并兼容。
 */
export const parseBooleanResponse = (raw: unknown): boolean => {
  const v = unwrapGatewayData(raw);
  if (v === true) {
    return true;
  }
  if (v === false) {
    return false;
  }
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true") {
      return true;
    }
    if (s === "false") {
      return false;
    }
  }
  return false;
};

/** `Pagination<T>` / PageResultState（或包在多层 data 内） */
export const parsePageResultState = <T>(raw: unknown): PageResultState<T> => {
  const v = unwrapGatewayData(raw);
  if (v != null && typeof v === "object" && "records" in v && Array.isArray((v as { records: unknown }).records)) {
    const p = v as PageResultState<T>;
    return {
      total: typeof p.total === "number" && Number.isFinite(p.total) ? p.total : 0,
      pages: typeof p.pages === "number" && Number.isFinite(p.pages) ? p.pages : 0,
      records: p.records ?? [],
    };
  }
  return { total: 0, pages: 0, records: [] };
};

const toNullableFiniteNumber = (raw: unknown): number | null => {
  if (raw == null || raw === "") {
    return null;
  }
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
};

const toStr = (raw: unknown): string => (typeof raw === "string" ? raw : String(raw ?? ""));

/** GET 粮仓绑定详情 `RadarBindingDetailVO`（或包在多层 data 内） */
export const parseRadarBindingDetailResponse = (raw: unknown): LiangcangRadarBindingDetailVO | null => {
  const v = unwrapGatewayData(raw);
  if (v == null || typeof v !== "object") {
    return null;
  }
  const o = v as Record<string, unknown>;
  const warehouseId = toNullableFiniteNumber(o.warehouseId);
  if (warehouseId == null) {
    return null;
  }
  const radarRaw = o.radarDeviceId;
  const radarDeviceId = radarRaw == null ? null : toNullableFiniteNumber(radarRaw);

  const devicesRaw = o.devices;
  const devices: LiangcangRadarBindingDetailVO["devices"] = [];
  if (Array.isArray(devicesRaw)) {
    for (const item of devicesRaw) {
      if (item == null || typeof item !== "object") {
        continue;
      }
      const d = item as Record<string, unknown>;
      const deviceId = toNullableFiniteNumber(d.deviceId);
      if (deviceId == null) {
        continue;
      }
      devices.push({
        deviceId,
        deviceSn: toStr(d.deviceSn),
        deviceType: toStr(d.deviceType),
        deviceName: toStr(d.deviceName),
      });
    }
  }

  return {
    warehouseId,
    radarDeviceId,
    granaryName: toStr(o.granaryName),
    category: toStr(o.category),
    level: toStr(o.level),
    maxHeight: toNullableFiniteNumber(o.maxHeight),
    granaryVolume: toNullableFiniteNumber(o.granaryVolume),
    devices,
  };
};

type LocationCardGasKey = "gasCo" | "gasCo2" | "gasNo" | "gasO2" | "gasPh3" | "gasSo2f2";

const GAS_PROP_CODE_MAP: Record<string, LocationCardGasKey> = {
  gasCo: "gasCo",
  gasCO: "gasCo",
  gasCo2: "gasCo2",
  gasCO2: "gasCo2",
  gasNo: "gasNo",
  gasNO: "gasNo",
  gasO2: "gasO2",
  gasPh3: "gasPh3",
  gasPH3: "gasPh3",
  gasSo2f2: "gasSo2f2",
  gasSO2F2: "gasSo2f2",
};

const readSubObject = (o: Record<string, unknown>, key: string): Record<string, unknown> | null => {
  const v = o[key];
  if (v != null && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return null;
};

const firstFinite = (...nums: Array<number | null | undefined>): number | null => {
  for (const n of nums) {
    if (n != null && Number.isFinite(n)) {
      return n;
    }
  }
  return null;
};

const readStr = (o: Record<string, unknown>, ...keys: string[]): string => {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string") {
      return v;
    }
    if (typeof v === "number" && Number.isFinite(v)) {
      return String(v);
    }
  }
  return "";
};

const readOptionalBool = (o: Record<string, unknown>, ...keys: string[]): boolean | null => {
  for (const k of keys) {
    const v = o[k];
    if (v === true || v === false) {
      return v;
    }
    if (typeof v === "string") {
      const s = v.trim().toLowerCase();
      if (s === "online" || s === "true" || s === "1") {
        return true;
      }
      if (s === "offline" || s === "false" || s === "0") {
        return false;
      }
    }
    if (typeof v === "number" && (v === 1 || v === 0)) {
      return v === 1;
    }
  }
  return null;
};

const parseGasTelemetryItems = (raw: unknown): Partial<Record<LocationCardGasKey, number>> => {
  const out: Partial<Record<LocationCardGasKey, number>> = {};
  if (!Array.isArray(raw)) {
    return out;
  }
  for (const item of raw) {
    if (item == null || typeof item !== "object") {
      continue;
    }
    const row = item as Record<string, unknown>;
    const codeRaw = row.propCode ?? row.code ?? row.propertyCode;
    const code = typeof codeRaw === "string" ? codeRaw : String(codeRaw ?? "");
    const mapped = GAS_PROP_CODE_MAP[code];
    if (mapped == null) {
      continue;
    }
    const n = toNullableFiniteNumber(row.propValue ?? row.value);
    if (n != null) {
      out[mapped] = n;
    }
  }
  return out;
};

const mergeGasFields = (
  o: Record<string, unknown>,
  fromTel: Partial<Record<LocationCardGasKey, number>>,
): Record<LocationCardGasKey, number | null> => ({
  gasCo: firstFinite(toNullableFiniteNumber(o.gasCo), toNullableFiniteNumber(o.coPpm), fromTel.gasCo),
  gasCo2: firstFinite(toNullableFiniteNumber(o.gasCo2), toNullableFiniteNumber(o.co2Ppm), fromTel.gasCo2),
  gasNo: firstFinite(toNullableFiniteNumber(o.gasNo), toNullableFiniteNumber(o.noPpm), fromTel.gasNo),
  gasO2: firstFinite(toNullableFiniteNumber(o.gasO2), toNullableFiniteNumber(o.o2PercentVol), fromTel.gasO2),
  gasPh3: firstFinite(toNullableFiniteNumber(o.gasPh3), toNullableFiniteNumber(o.phosphinePpm), fromTel.gasPh3),
  gasSo2f2: firstFinite(toNullableFiniteNumber(o.gasSo2f2), toNullableFiniteNumber(o.sulfurylFluoridePpm), fromTel.gasSo2f2),
});

const parseQualityInspections = (raw: unknown): LiangcangWarehouseLocationCardInfoVO["qualityInspections"] => {
  if (!Array.isArray(raw)) {
    return [];
  }
  const rows: LiangcangWarehouseLocationCardInfoVO["qualityInspections"] = [];
  for (const item of raw) {
    if (item == null || typeof item !== "object") {
      continue;
    }
    const o = item as Record<string, unknown>;
    rows.push({
      id: toStr(o.id),
      inspectionTime: toStr(o.inspectionTime || o.inspectTime || o.checkTime || o.detectTime || o.createTime),
      inspector: toStr(o.inspector || o.checker || o.inspectorName),
      moisture: toNullableFiniteNumber(o.moisture),
      impurity: toNullableFiniteNumber(o.impurity),
      mixedRate: toNullableFiniteNumber(o.mixedRate),
      headRiceRate: toNullableFiniteNumber(o.headRiceRate),
      outOfPaddyBrownRiceRate: firstFinite(
        toNullableFiniteNumber(o.outOfPaddyBrownRiceRate),
        toNullableFiniteNumber(o.valleyOutsideBrownRice),
      ),
      yellowRiceRate: firstFinite(toNullableFiniteNumber(o.yellowRiceRate), toNullableFiniteNumber(o.yellowGrainRice)),
      tasteScore: toNullableFiniteNumber(o.tasteScore),
      roughness: firstFinite(
        toNullableFiniteNumber(o.roughness),
        toNullableFiniteNumber(o.roughRiceYield),
        toNullableFiniteNumber(o.riceYield),
      ),
      fattyAcid: toNullableFiniteNumber(o.fattyAcid),
      cadmium: toNullableFiniteNumber(o.cadmium),
      aflatoxinB1: toNullableFiniteNumber(o.aflatoxinB1),
      lead: toNullableFiniteNumber(o.lead),
      mercury: toNullableFiniteNumber(o.mercury),
      inorganicArsenic: toNullableFiniteNumber(o.inorganicArsenic),
      colorSmell: toStr(o.colorSmell || o.colorAndSmell),
    });
  }
  return rows;
};

const readStrPreferWarehouse = (warehouseO: Record<string, unknown> | null, root: Record<string, unknown>, ...keys: string[]): string => {
  if (warehouseO != null) {
    const w = readStr(warehouseO, ...keys);
    if (w !== "") {
      return w;
    }
  }
  return readStr(root, ...keys);
};

const readNumPreferWarehouse = (
  warehouseO: Record<string, unknown> | null,
  root: Record<string, unknown>,
  ...keys: string[]
): number | null => {
  const fromW = warehouseO != null ? keys.map((k) => toNullableFiniteNumber(warehouseO[k])) : ([] as Array<number | null>);
  const fromR = keys.map((k) => toNullableFiniteNumber(root[k]));
  return firstFinite(...fromR, ...fromW);
};

const readCount = (o: Record<string, unknown> | null, ...keys: string[]): number | null => {
  if (o == null) {
    return null;
  }
  return firstFinite(...keys.map((k) => toNullableFiniteNumber(o[k])));
};

const parseDeviceStatusCount = (
  root: Record<string, unknown>,
  candidateObjects: Array<Record<string, unknown> | null>,
  fieldPrefix: string,
): LiangcangDeviceStatusCountVO => {
  const source = candidateObjects.find((item) => item != null) ?? null;
  const total = firstFinite(
    readCount(source, "total", "totalCount", "deviceCount", "deviceTotal"),
    readCount(root, `${fieldPrefix}DeviceCount`, `${fieldPrefix}DeviceTotal`, `${fieldPrefix}TotalCount`),
  );
  const online = firstFinite(
    readCount(source, "online", "onlineCount", "deviceOnline", "onlineDeviceCount"),
    readCount(root, `${fieldPrefix}OnlineCount`, `${fieldPrefix}DeviceOnlineCount`, `${fieldPrefix}OnlineDeviceCount`),
  );
  const offline = firstFinite(
    readCount(source, "offline", "offlineCount", "deviceOffline", "offlineDeviceCount"),
    readCount(root, `${fieldPrefix}OfflineCount`, `${fieldPrefix}DeviceOfflineCount`, `${fieldPrefix}OfflineDeviceCount`),
  );
  return {
    total: firstFinite(total, online != null && offline != null ? online + offline : null),
    online,
    offline: firstFinite(offline, total != null && online != null ? total - online : null),
  };
};

/** 接口 `usageRate` / `storageRate` 为小数比例时，换算为界面展示的百分比数值 */
const USAGE_RATE_TO_PERCENT = 100;

const normalizeUsageRatePercent = (raw: number | null, materialVolume: number | null, granaryVolume: number | null): number | null => {
  if (raw == null) {
    if (materialVolume != null && granaryVolume != null && granaryVolume > 0) {
      return (materialVolume / granaryVolume) * USAGE_RATE_TO_PERCENT;
    }
    return null;
  }
  if (raw >= 0 && raw <= 1) {
    if (materialVolume != null && granaryVolume != null && granaryVolume > 0) {
      const computedPercent = (materialVolume / granaryVolume) * USAGE_RATE_TO_PERCENT;
      const distanceAsPercent = Math.abs(raw - computedPercent);
      const distanceAsRatio = Math.abs(raw * USAGE_RATE_TO_PERCENT - computedPercent);
      return distanceAsPercent <= distanceAsRatio ? raw : raw * USAGE_RATE_TO_PERCENT;
    }
    return raw * USAGE_RATE_TO_PERCENT;
  }
  return raw;
};

/** GET `/liangcang/warehouse-management/location-card/info`（或包在多层 `data` 内） */
export const parseLocationCardInfoResponse = (raw: unknown): LiangcangWarehouseLocationCardInfoVO | null => {
  const v = unwrapGatewayData(raw);
  if (v == null || typeof v !== "object") {
    return null;
  }
  const o = v as Record<string, unknown>;
  const warehouseO = readSubObject(o, "warehouse");
  const warehouseId = firstFinite(
    toNullableFiniteNumber(o.warehouseId),
    warehouseO != null ? toNullableFiniteNumber(warehouseO.warehouseId) : null,
  );
  if (warehouseId == null) {
    return null;
  }

  const tempO = readSubObject(o, "temperature") ?? readSubObject(o, "temp") ?? readSubObject(o, "temperatureSensor");
  const radarO =
    readSubObject(o, "radarMeasurement") ?? readSubObject(o, "radar") ?? readSubObject(o, "stockRadar") ?? readSubObject(o, "storageRadar");
  const gasO = readSubObject(o, "gas") ?? readSubObject(o, "gasDetection");
  const configDetailO = readSubObject(o, "configDetail");
  const profileO = readSubObject(configDetailO ?? {}, "profile") ?? readSubObject(o, "profile");
  const environmentMonitorO = readSubObject(configDetailO ?? {}, "environmentMonitor") ?? readSubObject(o, "environmentMonitor");
  const qualityInspectionsRaw = configDetailO?.qualityInspections ?? o.qualityInspections ?? o.qualityInspectionList ?? o.inspections;
  const radarDeviceStatusO =
    readSubObject(o, "radarDeviceStats") ??
    readSubObject(o, "radarDeviceStatus") ??
    readSubObject(o, "radarDeviceCount") ??
    readSubObject(radarO ?? {}, "deviceStats") ??
    readSubObject(radarO ?? {}, "deviceStatus");
  const temperatureDeviceStatusO =
    readSubObject(o, "temperatureDeviceStats") ??
    readSubObject(o, "temperatureDeviceStatus") ??
    readSubObject(o, "tempHumidityDeviceStats") ??
    readSubObject(o, "tempHumidityDeviceStatus") ??
    readSubObject(tempO ?? {}, "deviceStats") ??
    readSubObject(tempO ?? {}, "deviceStatus");
  const gasDeviceStatusO =
    readSubObject(o, "gasDeviceStats") ??
    readSubObject(o, "gasDeviceStatus") ??
    readSubObject(o, "gasDetectionDeviceStats") ??
    readSubObject(o, "gasDetectionDeviceStatus") ??
    readSubObject(gasO ?? {}, "deviceStats") ??
    readSubObject(gasO ?? {}, "deviceStatus");

  const telemetryRaw = o.telemetry ?? o.telemetryList ?? o.deviceTelemetry ?? gasO?.telemetry ?? gasO?.items ?? o.gasList;

  const gasFromTelemetry = parseGasTelemetryItems(telemetryRaw);

  const gasSource: Record<string, unknown> = { ...o };
  if (gasO != null) {
    Object.assign(gasSource, gasO);
  }
  const mergedGas = mergeGasFields(gasSource, gasFromTelemetry);

  const tempVal = (...keys: string[]): number | null => {
    const fromSub = tempO != null ? keys.map((k) => toNullableFiniteNumber(tempO[k])) : ([] as Array<number | null>);
    const fromTop = keys.map((k) => toNullableFiniteNumber(o[k]));
    return firstFinite(...fromTop, ...fromSub);
  };

  const radarVal = (...keys: string[]): number | null => {
    const fromSub = radarO != null ? keys.map((k) => toNullableFiniteNumber(radarO[k])) : ([] as Array<number | null>);
    const fromTop = keys.map((k) => toNullableFiniteNumber(o[k]));
    return firstFinite(...fromTop, ...fromSub);
  };

  const granaryVol = firstFinite(
    readNumPreferWarehouse(warehouseO, o, "totalVolume", "granaryVolume"),
    profileO != null ? toNullableFiniteNumber(profileO.granaryVolume) : null,
    toNullableFiniteNumber(o.granaryVolume),
    toNullableFiniteNumber(o.totalVolume),
  );

  const maxH = firstFinite(
    readNumPreferWarehouse(warehouseO, o, "granaryHeight", "maxHeight", "warehouseHeight"),
    toNullableFiniteNumber(o.maxHeight),
    toNullableFiniteNumber(o.warehouseHeight),
  );

  const rawUsageRate = firstFinite(radarVal("usageRate"), toNullableFiniteNumber(o.usageRate), toNullableFiniteNumber(o.storageRate));
  const materialVolume = firstFinite(
    radarVal("materialVolume"),
    toNullableFiniteNumber(o.materialVolume),
    profileO != null ? toNullableFiniteNumber(profileO.materialVolume) : null,
  );
  const usageRatePercent = normalizeUsageRatePercent(rawUsageRate, materialVolume, granaryVol);

  return {
    warehouseId,
    granaryName: readStrPreferWarehouse(warehouseO, o, "name", "granaryName", "warehouseName"),
    category: readStrPreferWarehouse(warehouseO, o, "categoryName", "category", "granaryCategory"),
    level: readStrPreferWarehouse(warehouseO, o, "qualityGrade", "level", "qualityLevel"),
    maxHeight: maxH,
    height: profileO != null ? toNullableFiniteNumber(profileO.height) : null,
    length: profileO != null ? toNullableFiniteNumber(profileO.length) : null,
    width: profileO != null ? toNullableFiniteNumber(profileO.width) : null,
    granaryVolume: granaryVol,
    temperatureRangeMin: firstFinite(
      toNullableFiniteNumber(o.temperatureRangeMin),
      profileO != null ? toNullableFiniteNumber(profileO.temperatureRangeMin) : null,
    ),
    temperatureRangeMax: firstFinite(
      toNullableFiniteNumber(o.temperatureRangeMax),
      profileO != null ? toNullableFiniteNumber(profileO.temperatureRangeMax) : null,
    ),
    tempMax: firstFinite(
      tempVal("maxTemperature", "tempMax", "maxTemp", "highestTemperature", "max"),
      environmentMonitorO != null ? toNullableFiniteNumber(environmentMonitorO.maxTemperature) : null,
    ),
    tempMin: firstFinite(
      tempVal("minTemperature", "tempMin", "minTemp", "lowestTemperature", "min"),
      environmentMonitorO != null ? toNullableFiniteNumber(environmentMonitorO.minTemperature) : null,
    ),
    tempAvg: firstFinite(
      tempVal("avgTemperature", "tempAvg", "averageTemperature", "tempAverage", "avg"),
      environmentMonitorO != null ? toNullableFiniteNumber(environmentMonitorO.avgTemperature) : null,
    ),
    tempInternal: tempVal("internalTemperature", "tempInternal", "innerTemperature", "internal"),
    tempExternal: tempVal("externalTemperature", "tempExternal", "outerTemperature", "external"),
    materialVolume,
    digitalGrainVolume:
      profileO != null ? toNullableFiniteNumber(profileO.digitalGrainVolume) : toNullableFiniteNumber(o.digitalGrainVolume),
    deductedVolume: profileO != null ? toNullableFiniteNumber(profileO.deductedVolume) : toNullableFiniteNumber(o.deductedVolume),
    storageBagCount: profileO != null ? toNullableFiniteNumber(profileO.storageBagCount) : toNullableFiniteNumber(o.storageBagCount),
    averageBagWeight: profileO != null ? toNullableFiniteNumber(profileO.averageBagWeight) : toNullableFiniteNumber(o.averageBagWeight),
    materialWeight: firstFinite(
      radarVal("materialWeight"),
      toNullableFiniteNumber(o.materialWeight),
      profileO != null ? toNullableFiniteNumber(profileO.weight) : null,
    ),
    remainingVolume: firstFinite(
      toNullableFiniteNumber(o.remainingVolume),
      radarVal("remainingVolume"),
      profileO != null ? toNullableFiniteNumber(profileO.remainingVolume) : null,
    ),
    usageRate: usageRatePercent,
    tempHumidityDeviceOnline: readOptionalBool(o, "tempHumidityDeviceOnline", "temperatureDeviceOnline", "tempDeviceOnline"),
    radarOnline: readOptionalBool(o, "radarOnline", "stockRadarOnline", "storageRadarOnline"),
    gasOnline: readOptionalBool(o, "gasOnline", "gasDetectionOnline"),
    radarDeviceStatus: parseDeviceStatusCount(o, [radarDeviceStatusO, radarO], "radar"),
    temperatureDeviceStatus: parseDeviceStatusCount(o, [temperatureDeviceStatusO, tempO], "temperature"),
    gasDeviceStatus: parseDeviceStatusCount(o, [gasDeviceStatusO, gasO], "gas"),
    gasCo: mergedGas.gasCo,
    gasCo2: mergedGas.gasCo2,
    gasNo: mergedGas.gasNo,
    gasO2: mergedGas.gasO2,
    gasPh3: firstFinite(mergedGas.gasPh3, environmentMonitorO != null ? toNullableFiniteNumber(environmentMonitorO.ph3Ppm) : null),
    gasSo2f2: mergedGas.gasSo2f2,
    humidity: firstFinite(
      toNullableFiniteNumber(o.humidity),
      environmentMonitorO != null ? toNullableFiniteNumber(environmentMonitorO.humidity) : null,
    ),
    positionCode: readStr(profileO ?? {}, "positionCode"),
    keeper: readStr(profileO ?? {}, "keeper"),
    filingDate: readStr(profileO ?? {}, "filingDate"),
    authorizedUnit: readStr(profileO ?? {}, "authorizedUnit"),
    storageSite: readStr(profileO ?? {}, "storageSite"),
    inboundTime: readStr(profileO ?? {}, "inboundTime"),
    originPlace: readStr(profileO ?? {}, "originPlace"),
    storageNature: readStr(profileO ?? {}, "storageNature"),
    harvestYear: readStr(profileO ?? {}, "harvestYear"),
    storageMode: readStr(profileO ?? {}, "storageMode"),
    constantTemperatureRate: profileO != null ? toNullableFiniteNumber(profileO.constantTemperatureRate) : null,
    bulkDensityOrRoughness: profileO != null ? toNullableFiniteNumber(profileO.bulkDensityOrRoughness) : null,
    convertedMoisture: profileO != null ? toNullableFiniteNumber(profileO.convertedMoisture) : null,
    wholeOrImperfectGrain: profileO != null ? toNullableFiniteNumber(profileO.wholeOrImperfectGrain) : null,
    qualityInspections: parseQualityInspections(qualityInspectionsRaw),
    configDetail: configDetailO as LiangcangWarehouseLocationCardInfoVO["configDetail"],
  };
};

const parseStatisticsRow = (raw: unknown): LiangcangWarehouseStatisticsRow | null => {
  if (raw == null || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const warehouseId = toNullableFiniteNumber(o.warehouseId);
  return {
    timeDimension: toStr(o.timeDimension),
    warehouseId,
    warehouseName: toStr(o.warehouseName),
    type: toStr(o.type),
    level: toStr(o.level),
    warehouseHeight: toNullableFiniteNumber(o.warehouseHeight),
    averageEmptyWarehouseVolume: toNullableFiniteNumber(o.averageEmptyWarehouseVolume),
    averageInventory: toNullableFiniteNumber(o.averageInventory),
    averageInventoryWeight: toNullableFiniteNumber(o.averageInventoryWeight),
    turnoverRate: toNullableFiniteNumber(o.turnoverRate),
  };
};

const parseAcquisitionItem = (raw: unknown): LiangcangAcquisitionItem | null => {
  if (raw == null || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  return {
    acquisitionTime: toStr(o.acquisitionTime),
    warehouseId: toNullableFiniteNumber(o.warehouseId),
    warehouseName: toStr(o.warehouseName),
    type: toStr(o.type),
    level: toStr(o.level),
    warehouseHeight: toNullableFiniteNumber(o.warehouseHeight),
    emptyWarehouseVolume: toNullableFiniteNumber(o.emptyWarehouseVolume),
    goodsVolume: toNullableFiniteNumber(o.goodsVolume),
    weight: toNullableFiniteNumber(o.weight),
    turnoverRate: toNullableFiniteNumber(o.turnoverRate),
  };
};

const parseAcquisitionTurnoverItem = (raw: unknown): LiangcangAcquisitionTurnoverItem | null => {
  if (raw == null || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  return {
    timeDimension: toStr(o.timeDimension),
    turnoverRate: toNullableFiniteNumber(o.turnoverRate),
    acquisitionTime: toStr(o.acquisitionTime),
  };
};

const parseTimeDimensionTurnover = (raw: unknown): LiangcangTimeDimensionTurnoverItem | null => {
  if (raw == null || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  return {
    timeDimension: toStr(o.timeDimension),
    averageTurnoverRate: toNullableFiniteNumber(o.averageTurnoverRate),
  };
};

const parseTimeDimensionTrend = (raw: unknown): LiangcangTimeDimensionTrendItem | null => {
  if (raw == null || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  return {
    timeDimension: toStr(o.timeDimension),
    changeRate: toNullableFiniteNumber(o.changeRate),
  };
};

const parseArrayOf = <T>(raw: unknown, parser: (item: unknown) => T | null): T[] => {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: T[] = [];
  for (const item of raw) {
    const parsed = parser(item);
    if (parsed !== null) {
      out.push(parsed);
    }
  }
  return out;
};

const parseTemperatureTrendScope = (raw: unknown): LiangcangTemperatureTrendScope => {
  if (raw === "UPPER" || raw === "MIDDLE" || raw === "LOWER") {
    return raw;
  }
  return "ALL";
};

const parseTemperatureTrendPoint = (raw: unknown): LiangcangWarehouseTemperatureTrendPoint | null => {
  if (raw == null || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const temperature = toNullableFiniteNumber(o.temperature);
  if (temperature == null) {
    return null;
  }
  return {
    date: toStr(o.date),
    time: toStr(o.time),
    temperature,
  };
};

const parseTemperatureTrendCard = (raw: unknown): LiangcangWarehouseTemperatureTrendCard | null => {
  if (raw == null || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const temperature = toNullableFiniteNumber(o.temperature);
  const highAlarmThreshold = toNullableFiniteNumber(o.highAlarmThreshold);
  const lowAlarmThreshold = toNullableFiniteNumber(o.lowAlarmThreshold);
  if (temperature == null || highAlarmThreshold == null || lowAlarmThreshold == null) {
    return null;
  }
  return {
    scope: parseTemperatureTrendScope(o.scope),
    name: toStr(o.name),
    temperature,
    status: o.status === "HIGH" || o.status === "LOW" ? o.status : "NORMAL",
    highAlarmThreshold,
    lowAlarmThreshold,
  };
};

const parseTemperatureTrendChart = (raw: unknown): LiangcangWarehouseTemperatureTrendChart | null => {
  if (raw == null || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const actualSeries = parseArrayOf(o.actualSeries, parseTemperatureTrendPoint);
  const forecastSeries = parseArrayOf(o.forecastSeries, parseTemperatureTrendPoint);
  const warningLine = toNullableFiniteNumber(o.warningLine) ?? 0;
  if (actualSeries.length === 0 && forecastSeries.length === 0) {
    return null;
  }
  return {
    scope: parseTemperatureTrendScope(o.scope),
    warningLine,
    actualSeries,
    forecastSeries,
  };
};

/** POST `/liangcang/warehouse-management/temperature-trend/statistics`（或包在多层 `data` 内） */
export const parseWarehouseTemperatureTrendStatisticsResponse = (raw: unknown): LiangcangWarehouseTemperatureTrendStatisticsVO => {
  const empty: LiangcangWarehouseTemperatureTrendStatisticsVO = {
    updateTime: "",
    cards: [],
    chart: null,
  };
  const v = unwrapGatewayData(raw);
  if (v == null || typeof v !== "object") {
    return empty;
  }
  const o = v as Record<string, unknown>;
  return {
    updateTime: toStr(o.updateTime),
    cards: parseArrayOf(o.cards, parseTemperatureTrendCard),
    chart: parseTemperatureTrendChart(o.chart),
  };
};

/** GET `/liangcang/warehouse-management/bound-warehouse/list`：`BoundWarehouseSimpleVO[]`（或包在多层 `data` 内） */
export const parseBoundWarehouseSimpleList = (raw: unknown): LiangcangBoundWarehouseSimpleItem[] => {
  const v = unwrapGatewayData(raw);
  if (!Array.isArray(v)) {
    return [];
  }
  const out: LiangcangBoundWarehouseSimpleItem[] = [];
  for (const item of v) {
    if (item == null || typeof item !== "object") {
      continue;
    }
    const o = item as Record<string, unknown>;
    const warehouseId = toNullableFiniteNumber(o.warehouseId);
    if (warehouseId == null) {
      continue;
    }
    out.push({
      warehouseId,
      name: toStr(o.name),
      type: toStr(o.type),
    });
  }
  return out;
};

/** GET `/liangcang/warehouse-management/statistics`（或包在多层 `data` 内） */
export const parseWarehouseStatisticsResponse = (raw: unknown): LiangcangWarehouseStatisticsVO => {
  const empty: LiangcangWarehouseStatisticsVO = {
    items: [],
    acquisitionItems: [],
    acquisitionTurnoverItems: [],
    averageTurnoverRate: null,
    lastYearSamePeriodAverageTurnoverRate: null,
    totalYearOnYearChangeRate: null,
    previousPeriodAverageTurnoverRate: null,
    totalChainRatioChangeRate: null,
    timeDimensionTurnovers: [],
    timeDimensionTurnoverYearOnYearTrend: [],
    timeDimensionTurnoverChainRatioTrend: [],
  };
  const v = unwrapGatewayData(raw);
  if (v == null || typeof v !== "object") {
    return empty;
  }
  const o = v as Record<string, unknown>;
  return {
    items: parseArrayOf(o.items, parseStatisticsRow),
    acquisitionItems: parseArrayOf(o.acquisitionItems, parseAcquisitionItem),
    acquisitionTurnoverItems: parseArrayOf(o.acquisitionTurnoverItems, parseAcquisitionTurnoverItem),
    averageTurnoverRate: toNullableFiniteNumber(o.averageTurnoverRate),
    lastYearSamePeriodAverageTurnoverRate: toNullableFiniteNumber(o.lastYearSamePeriodAverageTurnoverRate),
    totalYearOnYearChangeRate: toNullableFiniteNumber(o.totalYearOnYearChangeRate),
    previousPeriodAverageTurnoverRate: toNullableFiniteNumber(o.previousPeriodAverageTurnoverRate),
    totalChainRatioChangeRate: toNullableFiniteNumber(o.totalChainRatioChangeRate),
    timeDimensionTurnovers: parseArrayOf(o.timeDimensionTurnovers, parseTimeDimensionTurnover),
    timeDimensionTurnoverYearOnYearTrend: parseArrayOf(o.timeDimensionTurnoverYearOnYearTrend, parseTimeDimensionTrend),
    timeDimensionTurnoverChainRatioTrend: parseArrayOf(o.timeDimensionTurnoverChainRatioTrend, parseTimeDimensionTrend),
  };
};
