import type { PropSchema } from "./types";

export type DevicePropertyValueType = "number" | "boolean" | "string" | "unknown";

const NUMBER_TYPES = new Set(["number", "numeric", "decimal", "int", "integer", "long", "short", "float", "double"]);
const BOOLEAN_TYPES = new Set(["boolean", "bool"]);
const STRING_TYPES = new Set(["string", "text", "varchar", "char", "enum", "date", "datetime", "timestamp"]);

export function normalizeDevicePropertyValueType(dataType: string | null | undefined): DevicePropertyValueType {
  const normalized = String(dataType ?? "")
    .trim()
    .toLowerCase();
  if (!normalized) return "unknown";
  if (NUMBER_TYPES.has(normalized)) return "number";
  if (BOOLEAN_TYPES.has(normalized)) return "boolean";
  if (STRING_TYPES.has(normalized)) return "string";
  return "unknown";
}

export function isDevicePropertyTypeCompatible(targetType: PropSchema["type"], sourceDataType: string | null | undefined): boolean {
  const sourceType = normalizeDevicePropertyValueType(sourceDataType);
  if (sourceType === "unknown") return true;
  if (targetType === "select") return true;
  if (targetType === "string") return sourceType === "string";
  if (targetType === "color") return sourceType === "string";
  return targetType === sourceType;
}
