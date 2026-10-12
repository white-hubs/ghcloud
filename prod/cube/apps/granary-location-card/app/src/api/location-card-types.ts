export interface LocationCardDeviceStatus {
  total: number | null;
  online: number | null;
  offline: number | null;
}

export type WarehouseTemperatureReportStatus = "NORMAL" | "HIGH" | "LOW" | "NO_DATA";

export interface WarehouseTemperatureReportPoint {
  cableNo: string;
  pointNo: string;
  deviceId: number | null;
  deviceName: string;
  temperature: number | null;
  status: WarehouseTemperatureReportStatus;
}

export interface LocationCardQualityInspection {
  id: number | null;
  inspectionTime: string;
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

export interface LocationCardTemperatureAlertNotice {
  alerting: boolean;
  message: string;
  distanceToThreshold: number | null;
  currentAvgTemperature: number | null;
  warningThreshold: number | null;
  alertRecordId: number | null;
  triggeredAt: string;
}

export interface LocationCardInfo {
  warehouseId: number;
  granaryName: string;
  category: string;
  level: string;
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
  usageRate: number | null;
  tempHumidityDeviceOnline: boolean | null;
  radarOnline: boolean | null;
  gasOnline: boolean | null;
  radarDeviceStatus: LocationCardDeviceStatus;
  temperatureDeviceStatus: LocationCardDeviceStatus;
  humidityDeviceStatus: LocationCardDeviceStatus;
  gasDeviceStatus: LocationCardDeviceStatus;
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
  temperatureAlertNotice: LocationCardTemperatureAlertNotice;
  qualityInspections: LocationCardQualityInspection[];
  reportList: WarehouseTemperatureReportPoint[][];
}
