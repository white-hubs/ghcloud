import dayjs from "dayjs";

import type { SmartInspectPoint } from "@/views/smart-inspect-common/types";

export type DroneInspectRecordDetail = Record<string, unknown>;

export type DroneInspectItemDetail = {
  name: string;
  standard: string;
  result: unknown;
  remark: string;
};

type StatusDisplay = { label: string; color: string };

const INSPECT_RESULT_DISPLAY_MAP: Record<string, StatusDisplay> = {
  NORMAL: { label: "正常", color: "#6ab539" },
  ABNORMAL: { label: "异常", color: "#ff4158" },
  PENDING: { label: "待巡检", color: "#86909c" },
};

const isEmptyValue = (value: unknown): boolean => {
  return value === undefined || value === null || value === "";
};

export const toDroneDisplayText = (value: unknown, fallback = "--"): string => {
  if (isEmptyValue(value)) return fallback;
  return String(value);
};

const pickValue = (record: Record<string, unknown>, keys: string[]): unknown => {
  return keys.map((key) => record[key]).find((value) => !isEmptyValue(value));
};

export const pickDroneText = (record: Record<string, unknown>, keys: string[], fallback = "--"): string => {
  return toDroneDisplayText(pickValue(record, keys), fallback);
};

export const formatDroneDateTime = (value: unknown): string => {
  if (isEmptyValue(value)) return "--";
  const date = dayjs(value as string | number | Date);
  return date.isValid() ? date.format("YYYY-MM-DD HH:mm:ss") : String(value);
};

export const getCoordinateText = (record: DroneInspectRecordDetail): string => {
  const direct = pickValue(record, ["coordinate", "coordinates", "latAndLon", "lntAndLat", "lngLat", "lonLat"]);
  if (!isEmptyValue(direct)) return String(direct);

  const lng = pickValue(record, ["actualLng", "commandLng", "lng", "longitude", "lon"]);
  const lat = pickValue(record, ["actualLat", "commandLat", "lat", "latitude"]);
  const height = pickValue(record, ["actualHeight", "commandHeight", "height", "altitude"]);
  const coordinate = [lng, lat, height]
    .filter((item) => !isEmptyValue(item))
    .map(String)
    .join(", ");

  return coordinate || "--";
};

export const getResultValue = (record: DroneInspectRecordDetail, text?: unknown): unknown => {
  return !isEmptyValue(text) ? text : pickValue(record, ["result", "inspectionStatus", "itemResultValue", "itemResultName"]);
};

export const getDroneRouteName = (record: DroneInspectRecordDetail): string => {
  return pickDroneText(record, [
    "routeName",
    "flightRouteName",
    "droneRouteName",
    "robotDogRouteName",
    "groundRouteName",
    "inspectionRouteName",
    "targetName",
  ]);
};

export const getDronePointSeq = (record: DroneInspectRecordDetail): string => {
  return pickDroneText(record, ["seqNo", "waypointSeqNo", "waypointNo", "pointSeqNo", "order", "sortNo"]);
};

export const getDroneAltitude = (record: DroneInspectRecordDetail): string => {
  const value = pickValue(record, ["actualHeight", "commandHeight", "height", "altitude"]);
  if (isEmptyValue(value)) return "--";
  const text = String(value);
  return /m$/i.test(text) ? text : `${text}m`;
};

export const getDroneDeviceName = (record: DroneInspectRecordDetail): string => {
  return pickDroneText(record, ["executionDeviceName", "deviceName", "droneDeviceName", "equipmentName", "nickname"]);
};

export const getDroneInspectMethod = (record: DroneInspectRecordDetail): string => {
  return pickDroneText(record, ["inspectMethod", "inspectionMethod", "methodName", "method"], "无人机巡检");
};

export const getInspectTimeValue = (record: DroneInspectRecordDetail): unknown => {
  return pickValue(record, [
    "time",
    "flyFinishAt",
    "finishTime",
    "inspectTime",
    "inspectionTime",
    "executeTime",
    "updateTime",
    "createTime",
  ]);
};

const mapStandardItemToDetail = (item: Record<string, unknown>, standardRecord: Record<string, unknown>): DroneInspectItemDetail => ({
  name: toDroneDisplayText(item.name || item.itemName || item.alias),
  standard: toDroneDisplayText(
    item.content ||
      item.standardContent ||
      item.standard ||
      standardRecord.describe ||
      standardRecord.standardDesc ||
      standardRecord.description ||
      standardRecord.name ||
      standardRecord.standardName,
  ),
  result: item.resultItemValue || item.result || item.itemResultValue || item.itemResultName || (item.errorValueFlag ? "ABNORMAL" : ""),
  remark: toDroneDisplayText(item.remarkResult || item.remark || item.errorDesc),
});

export const getInspectItemDetails = (record: DroneInspectRecordDetail): DroneInspectItemDetail[] => {
  const standardVOS = record.standardVOS ?? record.standardDTOList;
  if (Array.isArray(standardVOS)) {
    return standardVOS.flatMap((standard) => {
      const standardRecord = standard as Record<string, unknown>;
      const standardItems = standardRecord.standardItems;
      if (Array.isArray(standardItems) && standardItems.length) {
        return standardItems.map((item) => mapStandardItemToDetail(item as Record<string, unknown>, standardRecord));
      }
      const itemVOS = standardRecord.itemVOS;
      if (!Array.isArray(itemVOS) || !itemVOS.length) {
        return [
          {
            name: toDroneDisplayText(standardRecord.standardName || standardRecord.name),
            standard: toDroneDisplayText(standardRecord.standardDesc || standardRecord.description || standardRecord.content),
            result: standardRecord.result || standardRecord.inspectionStatus,
            remark: toDroneDisplayText(standardRecord.remark || standardRecord.errorDesc),
          },
        ];
      }
      return itemVOS.map((item) => mapStandardItemToDetail(item as Record<string, unknown>, standardRecord));
    });
  }

  const recordItems = record.recordItemVOS;
  if (Array.isArray(recordItems)) {
    return recordItems.map((item) => mapStandardItemToDetail(item as Record<string, unknown>, {}));
  }

  return [];
};

const resolveMediaUrl = (value: unknown): string => {
  const text = toDroneDisplayText(value, "");
  if (!text || text === "--") return "";
  if (/^https?:\/\//i.test(text)) return text;
  return `${window.location.origin}${text.startsWith("/") ? "" : "/"}${text}`;
};

const collectMediaUrls = (source: unknown): string[] => {
  if (!Array.isArray(source)) return [];
  return source
    .map((item) => {
      if (typeof item === "string") return resolveMediaUrl(item);
      const fileRecord = item as Record<string, unknown>;
      return resolveMediaUrl(fileRecord.path || fileRecord.url || fileRecord.fileUrl || fileRecord.downloadUrl);
    })
    .filter(Boolean);
};

export const getDroneMediaUrls = (record: DroneInspectRecordDetail): string[] => {
  const urls = [...collectMediaUrls(record.snapCaptureUrls), ...collectMediaUrls(record.fileVOS)];

  const standardVOS = record.standardVOS ?? record.standardDTOList;
  if (Array.isArray(standardVOS)) {
    standardVOS.forEach((standard) => {
      const standardRecord = standard as Record<string, unknown>;
      const standardItems = standardRecord.standardItems;
      if (Array.isArray(standardItems)) {
        standardItems.forEach((item) => {
          urls.push(...collectMediaUrls((item as Record<string, unknown>).fileVOS));
        });
      }
      const itemVOS = standardRecord.itemVOS;
      if (Array.isArray(itemVOS)) {
        itemVOS.forEach((item) => {
          urls.push(...collectMediaUrls((item as Record<string, unknown>).fileVOS));
        });
      }
    });
  }

  return [...new Set(urls)];
};

const normalizeEnumKey = (value: unknown): string => toDroneDisplayText(value, "").trim().toUpperCase();

export const getResultDisplay = (value: unknown): StatusDisplay => {
  const raw = toDroneDisplayText(value, "").trim();
  const preset = INSPECT_RESULT_DISPLAY_MAP[normalizeEnumKey(raw)];
  const label = preset?.label || (raw === "正常" ? "正常" : raw === "异常" ? "异常" : raw || "--");
  const color = preset?.color || (label === "正常" ? "#6ab539" : label === "异常" ? "#ff4158" : "#86909c");
  return { label, color };
};

export const isDroneWaypointCompleted = (point: SmartInspectPoint): boolean => {
  const status = String(point.status || "")
    .trim()
    .toUpperCase();
  if (status === "OVER" || status === "COMPLETED") return true;
  const result = String(point.result || point.inspectionStatus || "")
    .trim()
    .toUpperCase();
  return result === "NORMAL" || result === "ABNORMAL";
};

export const buildDroneDetailRecordFromPoint = (
  point: SmartInspectPoint,
  context: { routeName?: string; deviceName?: string; inspectMethod?: string },
): DroneInspectRecordDetail => ({
  ...point,
  routeName: context.routeName,
  deviceName: context.deviceName,
  inspectMethod: context.inspectMethod,
  seqNo: point.order,
  standardVOS: point.standardDTOList,
  result: point.result || point.inspectionStatus,
});
