import dayjs from "dayjs";

import type { GetDictionaryByItem } from "@ghcloud/cube-dictionary-service";
import { CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import type {
  InspectGeneratedTaskTargetVO,
  InspectTaskDepartmentCompletionStatVO,
  InspectTaskDepartmentMemberCompletionStatVO,
  InspectTaskTypeDistributionVO,
  RobotDogPointResult,
  TaskDetailResult,
  TaskTargetRelationPO,
  WaypointResult,
} from "@ghcloud/cube-inspection-command-screen-service";
import type { PersonItem, UserInfo } from "@ghcloud/cube-ouaa-service";
import { BASE_API } from "@ghcloud/cube-protocol";

import { authStore } from "./auth-store";
import { cubeDictionaryService, cubeInspectionCommandScreenService, cubeOuaaService } from "./service";
import type {
  DepartmentMember,
  DepartmentStat,
  InspectionPointItem,
  InspectionTargetCategory,
  LayerType,
  PersonnelDepartment,
  PersonnelItem,
  PersonnelTrackPageData,
  PersonnelTrackPoint,
  TaskItem,
  TaskInspectionMode,
  TaskObjectItem,
  TaskStatus,
  TimeFilter,
  TransferUser,
} from "@/types/dashboard";

const DAILY_INSPECTION_MAP_CONFIG = "DAILY_INSPECTION_MAP_CONFIG";
const FUSION_COMMUNICATE_PREFIX = `${BASE_API}/fusion-communicate`;
const OUAA_PREFIX = `${BASE_API}/ouaa`;
let currentUserIdCache = "";
let inspectionMapConfigCache: InspectionMapConfig | null | undefined;
let inspectionMapConfigPromise: Promise<InspectionMapConfig | null> | null = null;

export interface InspectionMapConfig {
  center: {
    lng: number;
    lat: number;
  };
  zoom: number;
  rotation: number;
  radius: number;
}

interface DashboardOverview {
  total: number;
  done: number;
  undone: number;
  timeout: number;
  completionRate: number;
}

interface TaskPageData {
  records: TaskItem[];
  total: number;
}

export type DeviceTaskStatusData = "待巡检" | "巡检中" | "已巡检" | "已终止" | "已超时";
export type DeviceRoutePointStatusData = "done" | "pending" | "abnormal";

export interface DeviceRouteInspectItemData {
  id: string;
  name: string;
  standard: string;
  result: "正常" | "异常" | "--";
  photo: string;
}

export interface DeviceRoutePointData {
  id: string;
  name: string;
  lng: number;
  lat: number;
  heightText: string;
  typeName?: string;
  timeText: string;
  result: "正常" | "异常" | "--";
  status: DeviceRoutePointStatusData;
  inspectionStatus: string;
  inspectionStatusName: string;
  inspectItems: DeviceRouteInspectItemData[];
}

export interface DeviceHazardDefaultLocation {
  locationName: string;
  longitude: number | null;
  latitude: number | null;
}

export interface DeviceInspectionTaskData {
  id: string;
  mode: "drone" | "robotDog";
  inspectionMode: TaskInspectionMode;
  name: string;
  deviceId: string;
  deviceName: string;
  routeName: string;
  level: "紧急" | "常规";
  status: DeviceTaskStatusData;
  objectCount: number;
  donePointCount: number;
  totalPointCount: number;
  beginTime: string;
  endTime: string;
  description: string;
  routePoints: DeviceRoutePointData[];
  hazardDefaultLocation?: DeviceHazardDefaultLocation;
}

export interface DroneTaskPageData {
  records: DeviceInspectionTaskData[];
  total: number;
}

export interface DroneTaskOverview {
  total: number;
  running: number;
  done: number;
}

interface TransferUserPageData {
  records: TransferUser[];
  total: number;
  pageRecordCount: number;
}

interface AbnormalOverview {
  abnormalTask: number;
  abnormalTaskTrend: number;
  abnormalPoint: number;
  abnormalPointTrend: number;
}

interface InspectionPointCategoryOption {
  label: string;
  value: InspectionTargetCategory;
}

interface FusionOrganization {
  id?: number | string | null;
  name?: string | null;
  children?: FusionOrganization[] | null;
}

interface FusionPosition {
  name?: string | null;
}

interface FusionPersonRaw {
  id?: number | string | null;
  name?: string | null;
  mobile?: string | null;
  account?: string | null;
  file?: { path?: string | null } | null;
  gps?: {
    lng?: number | string | null;
    lat?: number | string | null;
  } | null;
  organization?: {
    id?: number | string | null;
    name?: string | null;
  } | null;
  positions?: FusionPosition[] | null;
}

interface FusionTrackRaw {
  id?: number | string | null;
  lng?: number | string | null;
  lat?: number | string | null;
  address?: string | null;
  uploadTime?: number | string | null;
}

interface PageResultWithCount<T> {
  total?: number;
  pages?: number;
  records?: T[];
}

interface DeviceExpandInfoData {
  lntAndLat?: string;
  locationDes?: string;
}

const dashboardGateway = new CubeGateway(authStore);

const unwrapLegacyData = <T>(resp: LegacyServiceError<T> | T): T => {
  return typeof resp === "object" && resp !== null && "data" in resp && resp.data ? resp.data : (resp as T);
};

const toNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toPercent = (value: number | string | null | undefined): number => {
  const parsed = toNumber(String(value ?? "").replace("%", ""));
  const percent = parsed > 0 && parsed <= 1 ? parsed * 100 : parsed;
  return Math.max(0, Math.min(100, Math.round(percent)));
};

const parseCenter = (value: string | undefined): { lng: number; lat: number } | null => {
  const [lng, lat] = String(value || "")
    .split(",")
    .map(Number);
  if (Number.isFinite(lng) && Number.isFinite(lat)) {
    return { lng, lat };
  }
  return null;
};

const parseDeviceLntAndLat = (value: string | undefined): Pick<DeviceHazardDefaultLocation, "longitude" | "latitude"> => {
  const [lngText, latText] = String(value || "").split(",");
  const longitude = Number(lngText);
  const latitude = Number(latText);
  return {
    longitude: Number.isFinite(longitude) ? longitude : null,
    latitude: Number.isFinite(latitude) ? latitude : null,
  };
};

const readExpandInfo = (...sources: Record<string, unknown>[]): DeviceExpandInfoData | undefined => {
  for (const source of sources) {
    const expandInfo = asRecord(source.expandInfo);
    const lntAndLat = pickString(expandInfo, ["lntAndLat", "lngLat", "lnglat", "latAndLon"]);
    const locationDes = pickString(expandInfo, ["locationDes", "locationName", "address"]);
    if (lntAndLat || locationDes) {
      return { lntAndLat, locationDes };
    }
  }
  return undefined;
};

const mapTaskHazardDefaultLocation = (...sources: Record<string, unknown>[]): DeviceHazardDefaultLocation | undefined => {
  const expandInfo = readExpandInfo(...sources);
  if (!expandInfo?.locationDes && !expandInfo?.lntAndLat) {
    return undefined;
  }
  return {
    locationName: String(expandInfo.locationDes || "").trim(),
    ...parseDeviceLntAndLat(expandInfo.lntAndLat),
  };
};

const parseConfigNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isValidLngLat = (lng: number, lat: number): boolean => {
  return Number.isFinite(lng) && Number.isFinite(lat) && Math.abs(lng) <= 180 && Math.abs(lat) <= 90;
};

const getDistanceMeters = (a: { lng: number; lat: number }, b: { lng: number; lat: number }): number => {
  const earthRadius = 6371000;
  const toRadians = (value: number): number => (value * Math.PI) / 180;
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * earthRadius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const isInMapRadius = (gps: { lng: number; lat: number } | null, mapConfig: InspectionMapConfig | null): boolean => {
  if (!gps) {
    return false;
  }
  if (!mapConfig || !mapConfig.radius) {
    return true;
  }
  return getDistanceMeters(gps, mapConfig.center) <= Number(mapConfig.radius);
};

const findConfig = (configs: GetDictionaryByItem[], code: string): GetDictionaryByItem | undefined => {
  return configs.find((config) => config.code === code);
};

const getOverviewPeriod = (filter: TimeFilter): string | undefined => {
  const end = dayjs();
  if (filter.type === "today") {
    const today = end.format("YYYY-MM-DD");
    return `${today},${today}`;
  }
  if (filter.type === "7d") {
    return `${end.subtract(6, "day").format("YYYY-MM-DD")},${end.format("YYYY-MM-DD")}`;
  }
  if (filter.type === "30d") {
    return `${end.subtract(29, "day").format("YYYY-MM-DD")},${end.format("YYYY-MM-DD")}`;
  }
  if (filter.type === "custom") {
    const [start, customEnd] = filter.period ?? [];
    return start && customEnd ? `${start},${customEnd}` : undefined;
  }
  return undefined;
};

const statusMap: Record<string, TaskStatus> = {
  ACCEPT: "待接收",
  EXECUTING: "待巡检",
  OVER: "已巡检",
  EXPIRE: "已超时",
  STOP: "已终止",
};

const getTaskPeriod = getOverviewPeriod;

const targetCategoryOptions: InspectionPointCategoryOption[] = [
  { label: "设备", value: "DEVICE" },
  { label: "档位", value: "STALL" },
  { label: "资产", value: "PROPERTY" },
  { label: "现场点", value: "SITE_POINT" },
  { label: "风险源", value: "RISK_SOURCE" },
  // { label: '小散工程', value: 'SMALL_ENGINEERING' },
];

const targetCategoryNameMap = targetCategoryOptions.reduce<Record<string, string>>((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

const mapTargetCategoryName = (value: unknown): string => {
  const raw = String(value ?? "").trim();
  return raw ? targetCategoryNameMap[raw] || raw : "";
};

const getFirstText = (value: string | null | undefined): string => {
  return (
    String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)[0] || ""
  );
};

const toText = (value: number | string | null | undefined, fallback = "-"): string => {
  const text = String(value ?? "").trim();
  return text || fallback;
};

const formatTaskDateTime = (value: unknown, fallback = ""): string => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  const text = String(value).trim();
  if (!text) {
    return fallback;
  }
  const parsed =
    typeof value === "number" || /^\d+$/.test(text) ? dayjs(text.length === 10 ? Number(text) * 1000 : Number(text)) : dayjs(text);
  if (parsed.isValid()) {
    return parsed.format("YYYY-MM-DD HH:mm");
  }
  return text;
};

const mapTaskStatus = (status: string | null | undefined): TaskStatus => {
  const rawStatus = String(status || "");
  return statusMap[rawStatus] || "待巡检";
};

const mapTaskLevel = (level: string | null | undefined): string => {
  if (level === "URGENT") return "紧急";
  if (level === "GENERAL") return "普通";
  return String(level || "-");
};

const taskInspectionModeNameMap: Record<TaskInspectionMode, string> = {
  MANUAL: "常规巡检",
  DRONE: "纯无人机",
  HYBRID: "无人机与常规",
  ROBOT_DOG: "纯机器狗",
  HYBRID_ROBOT_DOG: "机器狗与常规",
};

const mapTaskInspectionMode = (value: unknown, fallback: TaskInspectionMode = "MANUAL"): TaskInspectionMode => {
  const mode = String(value || "")
    .trim()
    .toUpperCase();
  if (mode === "DRONE" || mode === "HYBRID" || mode === "MANUAL" || mode === "ROBOT_DOG" || mode === "HYBRID_ROBOT_DOG") {
    return mode;
  }
  return fallback;
};

const getTaskInspectionModeName = (mode: TaskInspectionMode): string => taskInspectionModeNameMap[mode];

const mapTaskItem = (item: TaskDetailResult, fallbackInspectionMode: TaskInspectionMode = "MANUAL"): TaskItem => {
  const rawStatus = String(item.status || "");
  const source = asRecord(item);
  const droneInspection = asRecord(source.droneInspection);
  const inspectionMode = mapTaskInspectionMode(item.inspectionMode, fallbackInspectionMode);
  const objectCount = toNumber(item.targetNum);
  const waypointCount =
    toNumber(pickUnknown(droneInspection, ["waypointTotal", "totalWaypoints", "totalPointCount"])) ||
    toNumber(pickUnknown(source, ["waypointCount", "waypointsCount", "totalWaypoints", "totalPointCount"]));
  return {
    id: String(item.id || ""),
    name: String(item.name || "-"),
    patrolType: String(item.typeName || "-"),
    patrolLevel: mapTaskLevel(item.level),
    inspectionMode,
    inspectionModeName: getTaskInspectionModeName(inspectionMode),
    deviceName:
      pickString(droneInspection, ["deviceName", "droneName"]) ||
      pickString(source, ["executionDeviceName", "deviceName", "droneName", "receiveNames"], ""),
    routeName: pickString(droneInspection, ["routeName"]) || pickString(source, ["routeName", "planName"], ""),
    objectCount: inspectionMode === "DRONE" ? waypointCount || objectCount : objectCount,
    status: mapTaskStatus(rawStatus),
    rawStatus,
    owner: getFirstText(item.receiveNames) || "-",
    ownerId: getFirstText(item.receiveIds),
    beginTime: formatTaskDateTime(item.beginTime ?? item.validBeginTime ?? item.createTime, ""),
    endTime: formatTaskDateTime(item.endTime ?? item.validEndTime, ""),
    description: pickString(source, ["description", "remark"], ""),
    canTransfer: rawStatus === "EXECUTING",
    canTerminate: rawStatus === "EXECUTING",
  };
};

const deviceTaskStatusMap: Record<string, DeviceTaskStatusData> = {
  ACCEPT: "待巡检",
  EXECUTING: "巡检中",
  OVER: "已巡检",
  EXPIRE: "已超时",
  STOP: "已终止",
};

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === "string") {
    const text = value.trim();
    if (text.startsWith("{") && text.endsWith("}")) {
      try {
        const parsed = JSON.parse(text) as unknown;
        return asRecord(parsed);
      } catch {
        return {};
      }
    }
  }
  if (Array.isArray(value)) {
    return asRecord(value.find((item) => typeof item === "object" && item !== null));
  }
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
};

const pickUnknown = (source: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) {
    const value = source[key];
    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }
  return undefined;
};

const pickString = (source: Record<string, unknown>, keys: string[], fallback = ""): string => {
  const value = pickUnknown(source, keys);
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter(Boolean)
      .join("、");
  }
  if (typeof value === "object") {
    return fallback;
  }
  const text = String(value ?? "").trim();
  return text || fallback;
};

const pickTargetTypeName = (source: Record<string, unknown>): string => {
  return (
    pickString(source, ["targetCategoryName", "categoryName", "typeName"]) ||
    mapTargetCategoryName(pickUnknown(source, ["targetCategory", "category", "targetType", "type"]))
  );
};

const mapDeviceTaskStatus = (status: string | null | undefined): DeviceTaskStatusData => {
  const rawStatus = String(status || "");
  return deviceTaskStatusMap[rawStatus] || "待巡检";
};

const mapDeviceTaskLevel = (level: string | null | undefined): DeviceInspectionTaskData["level"] => {
  return level === "URGENT" ? "紧急" : "常规";
};

const parseRouteLngLat = (source: Record<string, unknown>): { lng: number; lat: number } | null => {
  const directLng = Number(pickUnknown(source, ["commandLng", "actualLng", "mapLng", "lng", "longitude", "lon"]));
  const directLat = Number(pickUnknown(source, ["commandLat", "actualLat", "mapLat", "lat", "latitude"]));
  if (isValidLngLat(directLng, directLat)) {
    return { lng: directLng, lat: directLat };
  }
  const text = pickString(source, ["latAndLon", "lngLat", "lnglat", "coordinate", "coordinates"]);
  const [lng, lat] = text
    .split(/[,\s]+/)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
  return isValidLngLat(lng, lat) ? { lng, lat } : null;
};

const mapRoutePointResult = (source: Record<string, unknown>): DeviceRoutePointData["result"] => {
  const rawResult = pickString(source, [
    "result",
    "inspectResult",
    "inspectionResult",
    "state",
    "status",
    "inspectionStatus",
  ]).toUpperCase();
  if (/异常|ABNORMAL|ERROR|ERR|FAIL/.test(rawResult)) {
    return "异常";
  }
  if (/正常|NORMAL|PASS|SUCCESS|DONE|FINISH|OVER/.test(rawResult)) {
    return "正常";
  }
  return "--";
};

const getRoutePointInspectionStatus = (source: Record<string, unknown>): string => {
  return pickString(source, ["inspectionStatus", "inspectStatus", "pointInspectionStatus", "targetInspectionStatus", "state", "status"]);
};

const mapRoutePointInspectionStatusName = (status: string, result: DeviceRoutePointData["result"]): string => {
  const rawStatus = status.toUpperCase();
  if (/ABNORMAL|ERROR|ERR|FAIL|异常/.test(rawStatus) || result === "异常") {
    return "异常";
  }
  if (/OVER|DONE|FINISH|FINISHED|COMPLETE|COMPLETED|NORMAL|PASS|SUCCESS|已巡检|已完成|正常/.test(rawStatus) || result === "正常") {
    return "已巡检";
  }
  if (/EXECUT|PROCESS|PROGRESS|巡检中|执行中/.test(rawStatus)) {
    return "巡检中";
  }
  if (/ACCEPT|WAIT|PENDING|TODO|NOT_START|UNINSPECT|未巡检|待巡检|待接收/.test(rawStatus)) {
    return "待巡检";
  }
  return status || "--";
};

const mapRoutePointStatus = (source: Record<string, unknown>, result: DeviceRoutePointData["result"]): DeviceRoutePointStatusData => {
  const rawInspectionStatus = getRoutePointInspectionStatus(source).toUpperCase();
  if (/ABNORMAL|ERROR|ERR|FAIL|异常/.test(rawInspectionStatus)) {
    return "abnormal";
  }
  if (/OVER|DONE|FINISH|FINISHED|COMPLETE|COMPLETED|NORMAL|PASS|SUCCESS|已巡检|已完成|正常/.test(rawInspectionStatus)) {
    return result === "异常" ? "abnormal" : "done";
  }
  if (result === "异常") {
    return "abnormal";
  }
  if (result === "正常") {
    return "done";
  }
  const rawStatus = pickString(source, ["state", "status"]).toUpperCase();
  return /DONE|FINISH|OVER|NORMAL|PASS/.test(rawStatus) ? "done" : "pending";
};

const mapRouteInspectItemResult = (source: Record<string, unknown>): DeviceRouteInspectItemData["result"] => {
  const rawResult = pickString(source, [
    "result",
    "inspectResult",
    "inspectionResult",
    "itemResult",
    "itemResultValue",
    "resultItemValue",
    "status",
  ]).toUpperCase();
  const rawErrorFlag = source.errorValueFlag ?? source.errorFlag ?? source.abnormalFlag;
  if (rawErrorFlag === true || /异常|ABNORMAL|ERROR|ERR|FAIL/.test(rawResult)) {
    return "异常";
  }
  if (/正常|NORMAL|PASS|SUCCESS|DONE|FINISH|OVER|是|否/.test(rawResult)) {
    return "正常";
  }
  return "--";
};

const mapRouteInspectItems = (source: Record<string, unknown>): DeviceRouteInspectItemData[] => {
  const standardVOS = pickUnknown(source, ["standardVOS", "standardVOList", "standards"]);
  if (Array.isArray(standardVOS)) {
    return standardVOS.flatMap((standard, standardIndex) => {
      const standardRecord = asRecord(standard);
      const standardName = pickString(standardRecord, ["name", "standardName"], `巡检标准${standardIndex + 1}`);
      const standardItems = standardRecord.standardItems;
      if (!Array.isArray(standardItems)) {
        return [];
      }
      return standardItems.map((item, itemIndex) => {
        const record = asRecord(item);
        const name = pickString(record, ["itemName", "inspectionItemName", "name", "alias", "content"], `巡检项${itemIndex + 1}`);
        return {
          id: pickString(record, ["id", "itemId", "standardItemId"], `${standardName}-${itemIndex + 1}`),
          name,
          standard: standardName,
          result: mapRouteInspectItemResult(record),
          photo: pickString(record, ["photo", "photoText", "image", "imageUrl", "fileName", "attachmentName"], "--"),
        };
      });
    });
  }
  const rawItems = pickUnknown(source, [
    "inspectItems",
    "inspectionItems",
    "inspectionItemList",
    "itemList",
    "items",
    "standardItems",
    "recordTaskResultList",
    "taskRateResults",
  ]);
  if (!Array.isArray(rawItems)) {
    return [];
  }
  return rawItems
    .map((item, index) => {
      const record = asRecord(item);
      const name = pickString(record, ["itemName", "inspectionItemName", "name", "alias", "content"], `巡检项${index + 1}`);
      return {
        id: pickString(record, ["id", "itemId", "standardItemId"], `${name}-${index + 1}`),
        name,
        standard: pickString(record, ["standardName", "standard", "standardContent", "content", "remark"], "--"),
        result: mapRouteInspectItemResult(record),
        photo: pickString(record, ["photo", "photoText", "image", "imageUrl", "fileName", "attachmentName"], "--"),
      };
    })
    .filter((item) => item.name);
};

const mapUnknownRoutePoint = (value: unknown, index: number, taskId: string): DeviceRoutePointData | null => {
  const source = asRecord(value);
  const lngLat = parseRouteLngLat(source);
  if (!lngLat) {
    return null;
  }
  const result = mapRoutePointResult(source);
  const inspectionStatus = getRoutePointInspectionStatus(source);
  return {
    id: pickString(source, ["id", "targetId", "inspectionId", "pointId"], `${taskId}-point-${index + 1}`),
    name: pickString(source, ["waypointName", "name", "targetName", "pointName", "routePointName"], `航点${index + 1}`),
    lng: lngLat.lng,
    lat: lngLat.lat,
    heightText: pickString(
      source,
      ["commandHeight", "heightText", "actualHeight", "height", "targetAddress", "location", "address", "targetAreaName"],
      "-",
    ),
    typeName: pickTargetTypeName(source) || pickString(source, ["waypointType", "cameraType"]),
    timeText: formatTaskDateTime(pickUnknown(source, ["timeText", "time", "inspectTime", "finishTime", "updateTime"]), "--"),
    result,
    status: mapRoutePointStatus(source, result),
    inspectionStatus,
    inspectionStatusName: mapRoutePointInspectionStatusName(inspectionStatus, result),
    inspectItems: mapRouteInspectItems(source),
  };
};

const mapTaskRoutePoints = (item: TaskDetailResult, taskId: string): DeviceRoutePointData[] => {
  const source = asRecord(item);
  for (const key of ["waypoints", "routePoints", "points", "inspectionObjs", "targetList", "targetVOS"]) {
    const value = source[key];
    if (Array.isArray(value)) {
      return value
        .map((point, index) => mapUnknownRoutePoint(point, index, taskId))
        .filter((point): point is DeviceRoutePointData => point !== null);
    }
  }
  return [];
};

const getTaskCompletionPercent = (source: Record<string, unknown>): number => {
  return toPercent(pickString(source, ["recordCompletionRate", "completionRate", "progress"]));
};

interface DeviceTaskMapOptions {
  mode: DeviceInspectionTaskData["mode"];
  inspectionKey: "droneInspection" | "robotDogInspection";
  fallbackInspectionMode: TaskInspectionMode;
  fallbackDeviceId: string;
  fallbackDeviceName: string;
  deviceIdKeys: string[];
  deviceNameKeys: string[];
}

const mapDeviceTaskItem = (item: TaskDetailResult, options: DeviceTaskMapOptions): DeviceInspectionTaskData => {
  const source = asRecord(item);
  const deviceInspection = asRecord(source[options.inspectionKey]);
  const id = String(item.id || "");
  const status = mapDeviceTaskStatus(item.status);
  const inspectionMode = mapTaskInspectionMode(item.inspectionMode, options.fallbackInspectionMode);
  const routePoints = mapTaskRoutePoints(item, id);
  const hazardDefaultLocation = mapTaskHazardDefaultLocation(source, deviceInspection);
  const objectCount = toNumber(item.targetNum);
  const waypointCount =
    toNumber(pickUnknown(deviceInspection, ["waypointTotal", "totalWaypoints", "totalPointCount"])) ||
    toNumber(pickUnknown(source, ["waypointCount", "waypointsCount", "totalWaypoints", "totalPointCount"]));
  const totalPointCount = routePoints.length || waypointCount || objectCount;
  const completionPercent = getTaskCompletionPercent(source);
  const donePointCount =
    totalPointCount > 0
      ? routePoints.length
        ? routePoints.filter((point) => point.status === "done" || point.status === "abnormal").length
        : toNumber(pickUnknown(deviceInspection, ["finishedWaypointCount", "donePointCount", "finishedCount"])) ||
          (status === "已巡检" ? totalPointCount : Math.round((totalPointCount * completionPercent) / 100))
      : 0;
  return {
    id,
    mode: options.mode,
    inspectionMode,
    name: String(item.name || "-"),
    deviceId:
      pickString(deviceInspection, options.deviceIdKeys) ||
      pickString(
        source,
        ["executionDeviceId", "deviceId", ...options.deviceIdKeys, "receiveIds"],
        id ? `${id}-${options.fallbackDeviceId}` : options.fallbackDeviceId,
      ),
    deviceName:
      pickString(deviceInspection, options.deviceNameKeys) ||
      pickString(source, ["executionDeviceName", "deviceName", ...options.deviceNameKeys, "receiveNames"], options.fallbackDeviceName),
    routeName:
      pickString(deviceInspection, ["routeName"]) ||
      pickString(source, ["routeName", "planName", "typeName"], String(item.typeName || "-")),
    level: mapDeviceTaskLevel(item.level),
    status,
    objectCount,
    donePointCount: Math.min(donePointCount, totalPointCount),
    totalPointCount,
    beginTime: formatTaskDateTime(pickUnknown(source, ["beginTime", "validBeginTime", "createTime"]), "--"),
    endTime: formatTaskDateTime(pickUnknown(source, ["endTime", "validEndTime"]), "--"),
    description: pickString(source, ["description", "remark"], ""),
    routePoints,
    ...(hazardDefaultLocation ? { hazardDefaultLocation } : {}),
  };
};

const mapDroneTaskItem = (item: TaskDetailResult): DeviceInspectionTaskData => {
  return mapDeviceTaskItem(item, {
    mode: "drone",
    inspectionKey: "droneInspection",
    fallbackInspectionMode: "DRONE",
    fallbackDeviceId: "drone",
    fallbackDeviceName: "无人机",
    deviceIdKeys: ["deviceId", "droneId"],
    deviceNameKeys: ["deviceName", "droneName"],
  });
};

const mapRobotDogTaskItem = (item: TaskDetailResult): DeviceInspectionTaskData => {
  return mapDeviceTaskItem(item, {
    mode: "robotDog",
    inspectionKey: "robotDogInspection",
    fallbackInspectionMode: "ROBOT_DOG",
    fallbackDeviceId: "robot-dog",
    fallbackDeviceName: "机器狗",
    deviceIdKeys: ["deviceId", "robotDogId", "robotId"],
    deviceNameKeys: ["deviceName", "robotDogName", "robotName"],
  });
};

const mapDroneOverview = (data: InspectTaskStatusStatVO): DroneTaskOverview => {
  const source = asRecord(data);
  return {
    total: toNumber(data.totalCount),
    running: toNumber(pickUnknown(source, ["executingCount", "runningCount", "inProgressCount", "uncompletedCount"])),
    done: toNumber(data.completedCount),
  };
};

const mapTaskObjectItem = (item: TaskTargetRelationPO): TaskObjectItem => {
  const targetId = String(item.targetId || "");
  const targetParentId = String(item.targetParentId ?? "").trim();
  const targetCategory = toText(item.targetCategory, "");
  const targetType = toText(item.targetType, "");
  return {
    id: String(item.id || targetId),
    taskId: String(item.taskId || ""),
    planId: String(item.planId || ""),
    targetId,
    targetName: toText(item.targetName),
    targetCode: toText(item.targetCode),
    targetCategory,
    targetCategoryName: mapTargetCategoryName(targetCategory),
    targetType,
    targetTypeName: mapTargetCategoryName(targetType),
    targetParentId,
    targetAddress: toText(item.targetAddress || item.location),
    targetAreaId: toText(item.targetAreaId, ""),
    targetAreaName: toText(item.targetAreaName),
    latAndLon: toText(item.latAndLon, ""),
    location: toText(item.location, ""),
    isRelated: targetParentId !== "" && targetParentId !== "0",
  };
};

const mapTransferUser = (item: PersonItem): TransferUser => {
  const organizations = Array.isArray(item.organizations)
    ? item.organizations
        .map((org) => org.name)
        .filter(Boolean)
        .join("-")
    : "";
  return {
    id: item.id,
    name: item.name,
    detail: organizations || item.mobile || "巡检员",
  };
};

const mapAbnormalTrend = (value: number | string | null | undefined): number => {
  const parsed = toNumber(String(value ?? "").replace("%", ""));
  const percent = Math.abs(parsed) > 0 && Math.abs(parsed) <= 1 ? parsed * 100 : parsed;
  return Math.round(percent);
};

const mapTaskType = (item: InspectTaskTypeDistributionVO): { name: string; value: number } => {
  return {
    name: toText(item.typeName),
    value: toNumber(item.taskTotal),
  };
};

const mapDepartmentStat = (item: InspectTaskDepartmentCompletionStatVO): DepartmentStat => {
  const id = String(item.deptId || "");
  return {
    id,
    name: toText(item.deptName),
    done: toNumber(item.completedTaskTotal),
    total: toNumber(item.taskTotal),
    members: [],
  };
};

const mapDepartmentMember = (item: InspectTaskDepartmentMemberCompletionStatVO): DepartmentMember => {
  return {
    name: toText(item.memberName),
    done: toNumber(item.completedTaskTotal),
    total: toNumber(item.taskTotal),
  };
};

const mapInspectionPoint = (item: InspectGeneratedTaskTargetVO, category: InspectionTargetCategory): InspectionPointItem => {
  const id = String(item.id || "");
  return {
    id,
    name: toText(item.name),
    code: toText(item.code),
    type: toText(item.type, ""),
    typeName: toText(item.typeName || item.type),
    category,
    categoryName: targetCategoryNameMap[category] || category,
    latAndLon: toText(item.latAndLon, ""),
    location: toText(item.location, ""),
  };
};

const mapPersonnelDepartment = (item: FusionOrganization): PersonnelDepartment => {
  return {
    id: String(item.id || ""),
    name: toText(item.name),
    children: Array.isArray(item.children) ? item.children.map(mapPersonnelDepartment).filter((child) => child.id) : [],
  };
};

const mapPersonnelItem = (item: FusionPersonRaw, mapConfig: InspectionMapConfig | null): PersonnelItem => {
  const lng = Number(item.gps?.lng);
  const lat = Number(item.gps?.lat);
  const gps = isValidLngLat(lng, lat) ? { lng, lat } : null;
  const positionName =
    Array.isArray(item.positions) && item.positions.length
      ? item.positions
          .map((position) => position.name)
          .filter(Boolean)
          .join(",")
      : "--";
  const account = toText(item.account, "");
  return {
    id: String(item.id || ""),
    name: toText(item.name),
    mobile: toText(item.mobile),
    account,
    file: item.file?.path ? { path: String(item.file.path) } : null,
    gps,
    organizationName: toText(item.organization?.name),
    positionName: positionName || "--",
    isOnline: Boolean(account && gps && isInMapRadius(gps, mapConfig)),
  };
};

const mapUserInfoToPersonnelItem = (item: UserInfo, fallbackId: string): PersonnelItem => {
  const userWithFile = item as UserInfo & { fileVO?: { path?: string | null } | null; file?: { path?: string | null } | null };
  const organizations = Array.isArray(item.organizations)
    ? item.organizations
        .map((org) => org.name)
        .filter(Boolean)
        .join(",")
    : "";
  const positions = Array.isArray(item.positions)
    ? item.positions
        .map((position) => position.name)
        .filter(Boolean)
        .join(",")
    : "";
  const filePath = userWithFile.fileVO?.path || userWithFile.file?.path || "";
  return {
    id: String(item.id || fallbackId),
    name: toText(item.name),
    mobile: toText(item.mobile),
    account: "",
    file: filePath ? { path: filePath } : null,
    gps: null,
    organizationName: organizations || "--",
    positionName: positions || "--",
    isOnline: true,
  };
};

const mapTrackPoint = (item: FusionTrackRaw): PersonnelTrackPoint | null => {
  const lng = Number(item.lng);
  const lat = Number(item.lat);
  if (!isValidLngLat(lng, lat)) {
    return null;
  }
  const uploadTime = item.uploadTime || "";
  return {
    id: String(item.id || `${lng},${lat},${uploadTime}`),
    lng,
    lat,
    address: toText(item.address),
    uploadTime,
    timeText: uploadTime ? dayjs(uploadTime).format("YYYY-MM-DD HH:mm:ss") : "-",
  };
};

export const getDashboardOverview = async (params: { filter: TimeFilter }): Promise<DashboardOverview> => {
  const period = getOverviewPeriod(params.filter);
  const payload = period ? { period } : {};
  const data = await cubeInspectionCommandScreenService.getInspectTaskStatusStat(payload);
  return {
    total: toNumber(data.totalCount),
    done: toNumber(data.completedCount),
    undone: toNumber(data.uncompletedCount),
    timeout: toNumber(data.timeoutCount),
    completionRate: toPercent(data.completedRate),
  };
};

export const getTaskList = async (params: {
  filter: TimeFilter;
  keyword?: string;
  pageNumber: number;
  pageSize: number;
  oderByStatus: boolean;
}): Promise<TaskPageData> => {
  const period = getTaskPeriod(params.filter);
  const keyword = params.keyword?.trim();
  const payload = period
    ? {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        period,
        oderByStatus: params.oderByStatus,
        ...(keyword ? { keyword } : {}),
      }
    : { pageNumber: params.pageNumber, pageSize: params.pageSize, oderByStatus: params.oderByStatus, ...(keyword ? { keyword } : {}) };
  const data = await cubeInspectionCommandScreenService.getInspectTaskPage(payload);
  return {
    records: (data.records || []).map(mapTaskItem).filter((item) => item.id),
    total: toNumber(data.total),
  };
};

export const getTaskDetail = async (params: { taskId: string; fallbackInspectionMode?: TaskInspectionMode }): Promise<TaskItem> => {
  const data = await cubeInspectionCommandScreenService.getInspectTaskDetail({
    id: params.taskId,
    notTarget: true,
  });
  return mapTaskItem(data, params.fallbackInspectionMode);
};

export const getDroneTaskList = async (params: {
  filter?: TimeFilter;
  keyword?: string;
  pageNumber: number;
  pageSize: number;
}): Promise<DroneTaskPageData> => {
  const period = params.filter ? getTaskPeriod(params.filter) : undefined;
  const keyword = params.keyword?.trim();
  const data = await cubeInspectionCommandScreenService.getInspectTaskPage({
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
    droneInspection: true,
    oderByStatus: true,
    ...(keyword ? { keyword } : {}),
    ...(period ? { period } : {}),
  });
  return {
    records: (data.records || []).map(mapDroneTaskItem).filter((item) => item.id),
    total: toNumber(data.total),
  };
};

export const getDroneTaskOverview = async (params: { filter: TimeFilter }): Promise<DroneTaskOverview> => {
  const period = getTaskPeriod(params.filter);
  const data = await cubeInspectionCommandScreenService.getInspectTaskStatusStat({
    droneInspection: true,
    ...(period ? { period } : {}),
  });
  return mapDroneOverview(data);
};

export const getRobotDogTaskList = async (params: {
  filter?: TimeFilter;
  keyword?: string;
  pageNumber: number;
  pageSize: number;
}): Promise<DroneTaskPageData> => {
  const period = params.filter ? getTaskPeriod(params.filter) : undefined;
  const keyword = params.keyword?.trim();
  const data = await cubeInspectionCommandScreenService.getInspectTaskPage({
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
    robotDogInspection: true,
    oderByStatus: true,
    ...(keyword ? { keyword } : {}),
    ...(period ? { period } : {}),
  });
  return {
    records: (data.records || []).map(mapRobotDogTaskItem).filter((item) => item.id),
    total: toNumber(data.total),
  };
};

export const getRobotDogTaskOverview = async (params: { filter: TimeFilter }): Promise<DroneTaskOverview> => {
  const period = getTaskPeriod(params.filter);
  const data = await cubeInspectionCommandScreenService.getInspectTaskStatusStat({
    robotDogInspection: true,
    ...(period ? { period } : {}),
  });
  return mapDroneOverview(data);
};

export const getDeviceRelatedTasks = async (params: {
  deviceId: string;
  mode: DeviceInspectionTaskData["mode"];
  pageNumber?: number;
  pageSize?: number;
}): Promise<DroneTaskPageData> => {
  const isRobotDog = params.mode === "robotDog";
  const data = await cubeInspectionCommandScreenService.getInspectTaskPage({
    pageNumber: params.pageNumber ?? 1,
    pageSize: params.pageSize ?? 10,
    autoInspectionDeviceId: params.deviceId,
    autoInspectionCarrierType: isRobotDog ? "ROBOT_DOG" : "DRONE",
    oderByStatus: true,
  });
  return {
    records: (data.records || []).map(isRobotDog ? mapRobotDogTaskItem : mapDroneTaskItem).filter((item) => item.id),
    total: toNumber(data.total),
  };
};

export const getDroneTaskDetail = async (params: { taskId: string }): Promise<DeviceInspectionTaskData> => {
  const data = await cubeInspectionCommandScreenService.getInspectTaskDetail({
    id: params.taskId,
    notTarget: true,
  });
  return mapDroneTaskItem(data);
};

export const getRobotDogTaskDetail = async (params: { taskId: string }): Promise<DeviceInspectionTaskData> => {
  const data = await cubeInspectionCommandScreenService.getInspectTaskDetail({
    id: params.taskId,
    notTarget: true,
  });
  return mapRobotDogTaskItem(data);
};

export const getTaskObjects = async (params: { taskId: string }): Promise<TaskObjectItem[]> => {
  const data = await cubeInspectionCommandScreenService.getInspectTaskTargetList({ taskId: params.taskId });
  return data.map(mapTaskObjectItem).filter((item) => item.id || item.targetId);
};

export const getTaskWaypoints = async (params: { taskId: string; pageSize?: number }): Promise<DeviceRoutePointData[]> => {
  const data = await cubeInspectionCommandScreenService.getWaypointPage({
    inspectTaskId: params.taskId,
    pageNumber: 1,
    pageSize: params.pageSize ?? 200,
  });
  return (data.records || [])
    .map((point: WaypointResult, index) => mapUnknownRoutePoint(point, index, params.taskId))
    .filter((item): item is DeviceRoutePointData => item !== null);
};

export const getDroneTaskRoutePoints = async (params: { taskId: string }): Promise<DeviceRoutePointData[]> => {
  return getTaskWaypoints({ taskId: params.taskId });
};

export const getRobotDogTaskRoutePoints = async (params: { taskId: string }): Promise<DeviceRoutePointData[]> => {
  const data = await cubeInspectionCommandScreenService.getRobotDogPointPage({
    inspectTaskId: params.taskId,
    pageNumber: 1,
    pageSize: 200,
  });
  return (data.records || [])
    .map((point: RobotDogPointResult, index) => mapUnknownRoutePoint(point, index, params.taskId))
    .filter((item): item is DeviceRoutePointData => item !== null);
};

export const getAbnormalOverview = async (params: { filter: TimeFilter }): Promise<AbnormalOverview> => {
  const period = getOverviewPeriod(params.filter);
  const data = await cubeInspectionCommandScreenService.getInspectAbnormalOverview(period ? { period } : {});
  return {
    abnormalTask: toNumber(data.abnormalTask?.total),
    abnormalTaskTrend: mapAbnormalTrend(data.abnormalTask?.chainRatio),
    abnormalPoint: toNumber(data.abnormalPoint?.total),
    abnormalPointTrend: mapAbnormalTrend(data.abnormalPoint?.chainRatio),
  };
};

export const getPatrolTypeDistribution = async (params: { filter: TimeFilter }): Promise<Array<{ name: string; value: number }>> => {
  const period = getOverviewPeriod(params.filter);
  const data = await cubeInspectionCommandScreenService.getInspectTaskTypeDistribution(period ? { period } : {});
  return data.map(mapTaskType).filter((item) => item.name !== "-");
};

export const getDepartmentStats = async (params: { filter: TimeFilter }): Promise<DepartmentStat[]> => {
  const period = getOverviewPeriod(params.filter);
  const data = await cubeInspectionCommandScreenService.getInspectTaskDepartmentCompletionStat(period ? { period } : {});
  return data.map(mapDepartmentStat).filter((item) => item.id);
};

export const getDepartmentMembers = async (params: { deptId: string; filter: TimeFilter }): Promise<DepartmentMember[]> => {
  const period = getOverviewPeriod(params.filter);
  const data = await cubeInspectionCommandScreenService.getInspectTaskDepartmentMemberCompletionStat({
    deptId: params.deptId,
    ...(period ? { period } : {}),
  });
  return data.map(mapDepartmentMember).filter((item) => item.name !== "-");
};

export const getTransferUsers = async (params: {
  keyword?: string;
  excludeUserId?: string;
  pageNumber: number;
  pageSize: number;
}): Promise<TransferUserPageData> => {
  const data = await cubeOuaaService.getStaffPage({
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
    keyword: params.keyword || undefined,
    enabled: true,
  });
  return {
    records: (data.records || []).filter((item) => item.id !== params.excludeUserId).map(mapTransferUser),
    total: toNumber(data.total),
    pageRecordCount: (data.records || []).length,
  };
};

export const getPersonnelDepartments = async (): Promise<PersonnelDepartment[]> => {
  const url = `${OUAA_PREFIX}/authenticated/organizations/list`;
  const resp = await dashboardGateway.get<LegacyServiceError<FusionOrganization[]> | FusionOrganization[]>({
    url,
    payload: { enabled: true },
  });
  return unwrapLegacyData(resp)
    .map(mapPersonnelDepartment)
    .filter((item) => item.id);
};

export const getPersonnelList = async (params: {
  keyword?: string;
  organizationId?: string;
  mapConfig: InspectionMapConfig | null;
  currentUserId?: string;
}): Promise<PersonnelItem[]> => {
  const url = `${FUSION_COMMUNICATE_PREFIX}/fusion-communicate/users`;
  const payload = {
    ...(params.keyword ? { keyword: params.keyword } : {}),
    ...(params.organizationId ? { organizationIds: [params.organizationId] } : {}),
  };
  const resp = await dashboardGateway.get<LegacyServiceError<FusionPersonRaw[]> | FusionPersonRaw[]>({ url, payload });
  return unwrapLegacyData(resp)
    .map((item) => mapPersonnelItem(item, params.mapConfig))
    .filter((item) => item.id && item.id !== params.currentUserId)
    .sort((a, b) => {
      if (a.isOnline === b.isOnline) {
        return 0;
      }
      return a.isOnline ? -1 : 1;
    });
};

export const getPersonnelById = async (userId: string): Promise<PersonnelItem> => {
  const userInfo = await cubeOuaaService.getPersonInfo(userId);
  return mapUserInfoToPersonnelItem(userInfo, userId);
};

export const getPersonnelHistoryTrack = async (params: {
  userId: string;
  period: string;
  pageNumber: number;
  pageSize: number;
}): Promise<PersonnelTrackPageData> => {
  const url = `${FUSION_COMMUNICATE_PREFIX}/gps/page`;
  const resp = await dashboardGateway.get<LegacyServiceError<PageResultWithCount<FusionTrackRaw>> | PageResultWithCount<FusionTrackRaw>>({
    url,
    payload: params,
  });
  const data = unwrapLegacyData(resp);
  return {
    records: (data.records || []).map(mapTrackPoint).filter((item): item is PersonnelTrackPoint => item !== null),
    total: toNumber(data.total),
    pages: toNumber(data.pages),
  };
};

export const getAllPersonnelHistoryTrack = async (params: { userId: string; period: string }): Promise<PersonnelTrackPoint[]> => {
  const pageSize = 50;
  const first = await getPersonnelHistoryTrack({ ...params, pageNumber: 1, pageSize });
  const records = [...first.records];
  const totalPages = first.pages || Math.ceil(first.total / pageSize) || 1;
  for (let pageNumber = 2; pageNumber <= totalPages; pageNumber += 1) {
    const next = await getPersonnelHistoryTrack({ ...params, pageNumber, pageSize });
    records.push(...next.records);
  }
  return records;
};

export const filterPersonnelTrackInRadius = (
  points: PersonnelTrackPoint[],
  mapConfig: InspectionMapConfig | null,
): PersonnelTrackPoint[] => {
  return points.filter((point) => isInMapRadius({ lng: point.lng, lat: point.lat }, mapConfig));
};

const getCurrentUserIdFromStorage = (): string => {
  const keys = ["GH-UserInfo", "GH-User", "GH-LocalUserInfo", "cube-user-info"];
  for (const key of keys) {
    try {
      const value = sessionStorage.getItem(key) || localStorage.getItem(key);
      if (!value) {
        continue;
      }
      const parsed = JSON.parse(value) as { id?: string | number; userId?: string | number };
      const id = parsed.id ?? parsed.userId;
      if (id) {
        return String(id);
      }
    } catch {}
  }
  return "";
};

export const getCurrentUserId = async (): Promise<string> => {
  if (currentUserIdCache) {
    return currentUserIdCache;
  }
  const storageId = getCurrentUserIdFromStorage();
  if (storageId) {
    currentUserIdCache = storageId;
    return storageId;
  }
  try {
    const userInfo = await cubeOuaaService.getUserInfo();
    const userId = String(userInfo?.id || "");
    currentUserIdCache = userId;
    return userId;
  } catch {
    return "";
  }
};

export const transferTask = async (payload: { id: string; userId: string }): Promise<void> => {
  await cubeInspectionCommandScreenService.transferInspectTask({
    id: payload.id,
    userId: payload.userId,
  });
};

export const terminateTask = async (payload: { id: string }): Promise<void> => {
  await cubeInspectionCommandScreenService.stopInspectTask({ id: payload.id });
};

export const getMapLayersData = async (_params: { layers: LayerType[] }): Promise<{ categories: string[] }> => {
  return { categories: targetCategoryOptions.map((item) => item.label) };
};

export const getInspectionPointCategories = (): InspectionPointCategoryOption[] => {
  return targetCategoryOptions;
};

export const getInspectionPointsByCategory = async (params: { category: InspectionTargetCategory }): Promise<InspectionPointItem[]> => {
  const data = await cubeInspectionCommandScreenService.getInspectTaskTargetGeneratedList({
    targetCategory: params.category,
  });
  return data.map((item) => mapInspectionPoint(item, params.category)).filter((item) => item.id || item.name !== "-");
};

export const getLatestAbnormalInspectionPoints = async (
  params: { category?: InspectionTargetCategory } = {},
): Promise<InspectionPointItem[]> => {
  const data = await cubeInspectionCommandScreenService.getInspectTaskLatestAbnormalTargetList(
    params.category ? { targetCategory: params.category } : {},
  );
  return data.map((item) => mapInspectionPoint(item, params.category || "RISK_SOURCE")).filter((item) => item.id || item.name !== "-");
};

const loadInspectionMapConfig = async (): Promise<InspectionMapConfig | null> => {
  const configs = await cubeDictionaryService.getDictionaryByItem({
    itemCode: DAILY_INSPECTION_MAP_CONFIG,
  });
  const center = parseCenter(findConfig(configs, "lnglat")?.variable);
  if (!center) {
    return null;
  }
  return {
    center,
    zoom: parseConfigNumber(findConfig(configs, "zoom")?.variable, 14),
    rotation: parseConfigNumber(findConfig(configs, "rotation")?.variable, 0),
    radius: parseConfigNumber(findConfig(configs, "radius")?.variable, 0),
  };
};

export const getInspectionMapConfig = async (): Promise<InspectionMapConfig | null> => {
  if (inspectionMapConfigCache !== undefined) {
    return inspectionMapConfigCache;
  }
  if (!inspectionMapConfigPromise) {
    inspectionMapConfigPromise = loadInspectionMapConfig()
      .then((config) => {
        inspectionMapConfigCache = config;
        return config;
      })
      .finally(() => {
        inspectionMapConfigPromise = null;
      });
  }
  return inspectionMapConfigPromise;
};
