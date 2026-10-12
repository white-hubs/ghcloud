import type {
  LocationCardDeviceStatus,
  LocationCardInfo,
  WarehouseTemperatureReportPoint,
  WarehouseTemperatureReportStatus,
} from "./location-card-types";

const MAX_DATA_PEEL = 5;
const USAGE_RATE_TO_PERCENT = 100;

const toNumber = (raw: unknown): number | null => {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    const trimmed = raw.trim();
    const n = Number(trimmed);
    if (Number.isFinite(n)) {
      return n;
    }
    const matched = trimmed.match(/-?\d+(\.\d+)?/);
    if (matched != null) {
      const fallback = Number(matched[0]);
      return Number.isFinite(fallback) ? fallback : null;
    }
  }
  return null;
};

const toText = (raw: unknown): string => {
  if (typeof raw !== "string") {
    return "";
  }
  const t = raw.trim();
  return t === "" ? "" : t;
};

const toDisplayText = (raw: unknown): string => {
  if (typeof raw === "string") {
    const t = raw.trim();
    return t === "" ? "" : t;
  }
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return String(raw);
  }
  return "";
};

const toObject = (raw: unknown): Record<string, unknown> | null => {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  return raw as Record<string, unknown>;
};

const toBool = (raw: unknown): boolean | null => {
  if (typeof raw === "boolean") {
    return raw;
  }
  if (typeof raw === "number") {
    return raw === 1 ? true : raw === 0 ? false : null;
  }
  if (typeof raw === "string") {
    const t = raw.trim().toLowerCase();
    if (t === "true" || t === "1") {
      return true;
    }
    if (t === "false" || t === "0") {
      return false;
    }
  }
  return null;
};

const firstNumber = (...values: Array<number | null>): number | null => {
  for (const value of values) {
    if (value != null) {
      return value;
    }
  }
  return null;
};

const firstText = (...values: string[]): string => {
  for (const value of values) {
    if (value !== "") {
      return value;
    }
  }
  return "";
};

const normalizeUsageRatePercent = (raw: number | null, materialVolume: number | null, granaryVolume: number | null): number | null => {
  if (raw == null) {
    if (materialVolume != null && granaryVolume != null && granaryVolume > 0) {
      return (materialVolume / granaryVolume) * USAGE_RATE_TO_PERCENT;
    }
    return null;
  }
  // 兼容两种后端口径：0~1 小数比例 或 0~100 百分比数值。
  // 当 raw 处于 [0, 1] 且有体积数据时，通过“与体积推导值更接近”来判定是否需要 *100。
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

const parseQualityInspections = (raw: unknown): LocationCardInfo["qualityInspections"] => {
  if (!Array.isArray(raw)) {
    return [];
  }
  const rows: LocationCardInfo["qualityInspections"] = [];
  for (const item of raw) {
    const o = toObject(item);
    if (o == null) {
      continue;
    }
    rows.push({
      id: toNumber(o.id),
      inspectionTime: firstText(
        toDisplayText(o.inspectionTime),
        toDisplayText(o.inspectTime),
        toDisplayText(o.checkTime),
        toDisplayText(o.detectTime),
        toDisplayText(o.createTime),
      ),
      inspector: firstText(toText(o.inspector), toText(o.checker), toText(o.inspectorName)),
      moisture: toNumber(o.moisture),
      impurity: toNumber(o.impurity),
      mixedRate: toNumber(o.mixedRate),
      headRiceRate: toNumber(o.headRiceRate),
      outOfPaddyBrownRiceRate: firstNumber(toNumber(o.outOfPaddyBrownRiceRate), toNumber(o.valleyOutsideBrownRice)),
      yellowRiceRate: firstNumber(toNumber(o.yellowRiceRate), toNumber(o.yellowGrainRice)),
      tasteScore: toNumber(o.tasteScore),
      roughness: firstNumber(toNumber(o.roughness), toNumber(o.roughRiceYield), toNumber(o.riceYield)),
      fattyAcid: toNumber(o.fattyAcid),
      cadmium: toNumber(o.cadmium),
      aflatoxinB1: toNumber(o.aflatoxinB1),
      lead: toNumber(o.lead),
      mercury: toNumber(o.mercury),
      inorganicArsenic: toNumber(o.inorganicArsenic),
      colorSmell: firstText(toText(o.colorSmell), toText(o.colorAndSmell)),
    });
  }
  return rows;
};

const parseTemperatureReportStatus = (raw: unknown): WarehouseTemperatureReportStatus => {
  return raw === "NORMAL" || raw === "HIGH" || raw === "LOW" || raw === "NO_DATA" ? raw : "NO_DATA";
};

const parseTemperatureReportList = (raw: unknown): WarehouseTemperatureReportPoint[][] => {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((row) => {
    if (!Array.isArray(row)) {
      return [];
    }
    return row.map((item) => {
      const point = toObject(item);
      return {
        cableNo: toText(point?.cableNo),
        pointNo: toDisplayText(point?.pointNo),
        deviceId: toNumber(point?.deviceId),
        deviceName: toText(point?.deviceName),
        temperature: toNumber(point?.temperature),
        status: parseTemperatureReportStatus(point?.status),
      };
    });
  });
};

const parseTemperatureAlertNotice = (raw: unknown): LocationCardInfo["temperatureAlertNotice"] => {
  const notice = toObject(raw);
  return {
    alerting: toBool(notice?.alerting) === true,
    message: toDisplayText(notice?.message),
    distanceToThreshold: toNumber(notice?.distanceToThreshold),
    currentAvgTemperature: toNumber(notice?.currentAvgTemperature),
    warningThreshold: toNumber(notice?.warningThreshold),
    alertRecordId: toNumber(notice?.alertRecordId),
    triggeredAt: toDisplayText(notice?.triggeredAt),
  };
};

const unwrapGatewayData = (raw: unknown): unknown => {
  let value: unknown = raw;
  for (let depth = 0; depth < MAX_DATA_PEEL; depth += 1) {
    const obj = toObject(value);
    if (obj == null || !("data" in obj)) {
      break;
    }
    const next = obj.data;
    if (next === undefined) {
      break;
    }
    value = next;
  }
  return value;
};

const statusFrom = (root: Record<string, unknown>, source: Record<string, unknown> | null, prefix: string): LocationCardDeviceStatus => {
  const total = firstNumber(
    toNumber(source?.total),
    toNumber(source?.totalCount),
    toNumber(root[`${prefix}DeviceCount`]),
    toNumber(root[`${prefix}DeviceTotal`]),
  );
  const online = firstNumber(
    toNumber(source?.online),
    toNumber(source?.onlineCount),
    toNumber(root[`${prefix}OnlineCount`]),
    toNumber(root[`${prefix}DeviceOnlineCount`]),
  );
  const offline = firstNumber(
    toNumber(source?.offline),
    toNumber(source?.offlineCount),
    toNumber(root[`${prefix}OfflineCount`]),
    toNumber(root[`${prefix}DeviceOfflineCount`]),
  );
  return {
    total: firstNumber(total, online != null && offline != null ? online + offline : null),
    online,
    offline: firstNumber(offline, total != null && online != null ? total - online : null),
  };
};

export const parseLocationCardInfoResponse = (raw: unknown): LocationCardInfo | null => {
  const root = toObject(unwrapGatewayData(raw));
  if (root == null) {
    return null;
  }

  const warehouse = toObject(root.warehouse);
  const temperature = toObject(root.temperature) ?? toObject(root.temp);
  const radar = toObject(root.radarMeasurement) ?? toObject(root.radar);
  const gas = toObject(root.gas);
  const configDetail = toObject(root.configDetail);
  const profile = toObject(configDetail?.profile) ?? toObject(root.profile);
  const environmentMonitor = toObject(configDetail?.environmentMonitor) ?? toObject(root.environmentMonitor);
  const qualityInspectionsRaw =
    configDetail?.qualityInspections ?? root.qualityInspections ?? root.qualityInspectionList ?? root.inspections;

  const warehouseId = firstNumber(toNumber(root.warehouseId), toNumber(warehouse?.warehouseId));
  if (warehouseId == null) {
    return null;
  }

  const usageRateRaw = firstNumber(
    toNumber(radar?.usageRate),
    toNumber(warehouse?.usageRate),
    toNumber(profile?.usageRate),
    toNumber(root.usageRate),
    toNumber(root.storageRate),
  );
  const materialVolume = firstNumber(toNumber(root.materialVolume), toNumber(radar?.materialVolume), toNumber(profile?.materialVolume));
  const granaryVolume = firstNumber(toNumber(root.granaryVolume), toNumber(root.totalVolume), toNumber(warehouse?.totalVolume));
  const usageRate = normalizeUsageRatePercent(usageRateRaw, materialVolume, granaryVolume);

  return {
    warehouseId,
    granaryName: firstText(toText(root.granaryName), toText(root.warehouseName), toText(warehouse?.name), toText(profile?.positionNo)),
    category: firstText(toText(root.category), toText(root.granaryCategory), toText(warehouse?.categoryName)),
    level: firstText(toText(root.level), toText(root.qualityLevel), toText(warehouse?.qualityGrade)),
    height: toNumber(profile?.height),
    length: firstNumber(toNumber(profile?.length)),
    width: firstNumber(toNumber(profile?.width)),
    granaryVolume,
    temperatureRangeMin: firstNumber(toNumber(root.temperatureRangeMin), toNumber(profile?.temperatureRangeMin)),
    temperatureRangeMax: firstNumber(toNumber(root.temperatureRangeMax), toNumber(profile?.temperatureRangeMax)),
    tempMax: firstNumber(
      toNumber(root.tempMax),
      toNumber(root.maxTemperature),
      toNumber(temperature?.maxTemperature),
      toNumber(environmentMonitor?.maxTemperature),
    ),
    tempMin: firstNumber(
      toNumber(root.tempMin),
      toNumber(root.minTemperature),
      toNumber(temperature?.minTemperature),
      toNumber(environmentMonitor?.minTemperature),
    ),
    tempAvg: firstNumber(
      toNumber(root.tempAvg),
      toNumber(root.avgTemperature),
      toNumber(temperature?.avgTemperature),
      toNumber(environmentMonitor?.avgTemperature),
    ),
    tempInternal: firstNumber(toNumber(root.tempInternal), toNumber(root.internalTemperature), toNumber(temperature?.internalTemperature)),
    tempExternal: firstNumber(toNumber(root.tempExternal), toNumber(root.externalTemperature), toNumber(temperature?.externalTemperature)),
    materialVolume,
    digitalGrainVolume: firstNumber(toNumber(root.digitalGrainVolume), toNumber(profile?.digitalGrainVolume)),
    deductedVolume: firstNumber(toNumber(root.deductedVolume), toNumber(profile?.deductedVolume)),
    storageBagCount: firstNumber(toNumber(root.storageBagCount), toNumber(profile?.storageBagCount)),
    averageBagWeight: firstNumber(toNumber(root.averageBagWeight), toNumber(profile?.averageBagWeight)),
    materialWeight: firstNumber(
      toNumber(profile?.weight),
      toNumber(profile?.storageWeight),
      toNumber(profile?.inventoryWeight),
      toNumber(profile?.goodsWeight),
      toNumber(profile?.weightTon),
      toNumber(root.weight),
      toNumber(root.storageWeight),
      toNumber(root.inventoryWeight),
      toNumber(root.goodsWeight),
      toNumber(root.weightTon),
      toNumber(root.materialWeight),
      toNumber(radar?.materialWeight),
      toNumber(radar?.weight),
      toNumber(radar?.storageWeight),
      toNumber(radar?.inventoryWeight),
      toNumber(radar?.goodsWeight),
      toNumber(radar?.weightTon),
    ),
    remainingVolume: firstNumber(toNumber(root.remainingVolume), toNumber(radar?.remainingVolume), toNumber(profile?.remainingVolume)),
    usageRate,
    tempHumidityDeviceOnline: toBool(root.tempHumidityDeviceOnline) ?? toBool(root.temperatureDeviceOnline),
    radarOnline: toBool(root.radarOnline) ?? toBool(root.stockRadarOnline) ?? toBool(root.storageRadarOnline),
    gasOnline: toBool(root.gasOnline) ?? toBool(root.gasDetectionOnline),
    radarDeviceStatus: statusFrom(root, toObject(root.radarDeviceStatus) ?? toObject(root.radarDeviceStats), "radar"),
    temperatureDeviceStatus: statusFrom(
      root,
      toObject(root.temperatureDeviceStatus) ?? toObject(root.temperatureDeviceStats),
      "temperature",
    ),
    humidityDeviceStatus: statusFrom(
      root,
      toObject(root.humidityDeviceStatus) ??
        toObject(root.humidityDeviceStats) ??
        toObject(root.temperatureDeviceStatus) ??
        toObject(root.temperatureDeviceStats),
      "humidity",
    ),
    gasDeviceStatus: statusFrom(root, toObject(root.gasDeviceStatus) ?? toObject(root.gasDeviceStats), "gas"),
    gasCo: firstNumber(toNumber(root.gasCo), toNumber(gas?.coPpm)),
    gasCo2: firstNumber(toNumber(root.gasCo2), toNumber(gas?.co2Ppm), toNumber(environmentMonitor?.co2Ppm)),
    gasNo: firstNumber(toNumber(root.gasNo), toNumber(gas?.noPpm)),
    gasO2: firstNumber(toNumber(root.gasO2), toNumber(gas?.o2PercentVol), toNumber(environmentMonitor?.o2Percent)),
    gasPh3: firstNumber(toNumber(environmentMonitor?.ph3Ppm), toNumber(root.gasPh3), toNumber(gas?.phosphinePpm)),
    gasSo2f2: firstNumber(toNumber(root.gasSo2f2), toNumber(gas?.sulfurylFluoridePpm)),
    humidity: firstNumber(toNumber(root.humidity), toNumber(environmentMonitor?.humidity)),
    positionCode: firstText(toText(root.positionCode), toText(profile?.positionCode)),
    keeper: firstText(toText(root.keeper), toText(profile?.keeper)),
    filingDate: firstText(toText(root.filingDate), toText(profile?.filingDate)),
    authorizedUnit: firstText(toText(root.authorizedUnit), toText(profile?.authorizedUnit)),
    storageSite: firstText(toText(root.storageSite), toText(profile?.storageSite)),
    inboundTime: firstText(toText(root.inboundTime), toText(profile?.inboundTime)),
    originPlace: firstText(toText(root.originPlace), toText(root.origin), toText(profile?.originPlace), toText(profile?.origin)),
    storageNature: firstText(toText(root.storageNature), toText(profile?.storageNature)),
    harvestYear: firstText(toText(root.harvestYear), toText(profile?.harvestYear)),
    storageMode: firstText(toText(root.storageMode), toText(profile?.storageMode)),
    constantTemperatureRate: firstNumber(toNumber(root.constantTemperatureRate), toNumber(profile?.constantTemperatureRate)),
    bulkDensityOrRoughness: firstNumber(toNumber(root.bulkDensityOrRoughness), toNumber(profile?.bulkDensityOrRoughness)),
    convertedMoisture: firstNumber(toNumber(root.convertedMoisture), toNumber(profile?.convertedMoisture)),
    wholeOrImperfectGrain: firstNumber(toNumber(root.wholeOrImperfectGrain), toNumber(profile?.wholeOrImperfectGrain)),
    temperatureAlertNotice: parseTemperatureAlertNotice(root.temperatureAlertNotice),
    qualityInspections: parseQualityInspections(qualityInspectionsRaw),
    reportList: parseTemperatureReportList(root.reportList),
  };
};
