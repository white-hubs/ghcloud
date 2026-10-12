import type { ElementInstance } from "@cube-scada/core";

import type { ScadaPopupDeviceStyle, ScadaPopupEvent, ScadaPopupStyle, ScadaPopupTextStyle } from "./types";

const DEFAULT_CONTENT_STYLE: ScadaPopupTextStyle = {
  textAlign: "left",
  fontSize: 14,
  color: "#262626",
  fontWeight: 400,
  lineHeight: 1.6,
};

const DEFAULT_DEVICE_STYLE: ScadaPopupDeviceStyle = {
  layout: "rows",
  textAlign: "left",
  labelFontSize: 13,
  labelColor: "#8c8c8c",
  labelFontWeight: 400,
  valueFontSize: 14,
  valueColor: "#262626",
  valueFontWeight: 500,
  rowGap: 10,
  columnGap: 16,
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function numberInRange(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

function color(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function alignment(value: unknown): ScadaPopupTextStyle["textAlign"] {
  return value === "center" || value === "right" ? value : "left";
}

function normalizeStyle(raw: Record<string, unknown>): ScadaPopupStyle {
  const content = asRecord(raw.contentStyle);
  const device = asRecord(raw.deviceStyle);
  return {
    content: {
      textAlign: alignment(content.textAlign),
      fontSize: numberInRange(content.fontSize, DEFAULT_CONTENT_STYLE.fontSize, 1, 200),
      color: color(content.color, DEFAULT_CONTENT_STYLE.color),
      fontWeight: content.fontWeight === 700 || content.fontWeight === true ? 700 : 400,
      lineHeight: numberInRange(content.lineHeight, DEFAULT_CONTENT_STYLE.lineHeight, 0.8, 4),
    },
    device: {
      layout: device.layout === "columns" ? "columns" : "rows",
      textAlign: alignment(device.textAlign),
      labelFontSize: numberInRange(device.labelFontSize, DEFAULT_DEVICE_STYLE.labelFontSize, 1, 200),
      labelColor: color(device.labelColor, DEFAULT_DEVICE_STYLE.labelColor),
      labelFontWeight: device.labelFontWeight === 700 || device.labelFontWeight === true ? 700 : 400,
      valueFontSize: numberInRange(device.valueFontSize, DEFAULT_DEVICE_STYLE.valueFontSize, 1, 200),
      valueColor: color(device.valueColor, DEFAULT_DEVICE_STYLE.valueColor),
      valueFontWeight: device.valueFontWeight === 700 || device.valueFontWeight === true ? 700 : device.valueFontWeight === 400 ? 400 : 500,
      rowGap: numberInRange(device.rowGap, DEFAULT_DEVICE_STYLE.rowGap, 0, 100),
      columnGap: numberInRange(device.columnGap, DEFAULT_DEVICE_STYLE.columnGap, 0, 100),
    },
  };
}

/**
 * Normalizes ActionExecutor `showPopup` params into {@link ScadaPopupEvent}.
 * When only `contentId` is set (typical studio config), `content` is empty so the host can render a custom body.
 */
export function scadaPopupFromActionConfig(raw: Record<string, unknown>): ScadaPopupEvent {
  const contentId = typeof raw.contentId === "string" && raw.contentId.trim() ? raw.contentId.trim() : undefined;
  const title = typeof raw.title === "string" && raw.title.trim() ? raw.title.trim() : "提示";
  let content: string;
  if (typeof raw.content === "string") {
    content = raw.content;
  } else if (typeof raw.message === "string") {
    content = raw.message;
  } else if (contentId) {
    content = "";
  } else {
    content = JSON.stringify(raw);
  }
  return { title, content, contentId, raw, style: normalizeStyle(raw), deviceData: [] };
}

export function enrichScadaPopupWithSource(
  base: ScadaPopupEvent,
  source: ElementInstance,
  readValue?: (propCode: string) => string | number | boolean | undefined,
): ScadaPopupEvent {
  return {
    ...base,
    sourceElement: {
      id: source.id,
      type: source.type,
      name: source.label,
      deviceNo: source.deviceId,
      props: source.props ?? {},
    },
    deviceBinding: source.deviceBinding === "required" ? "required" : "off",
    deviceData: (source.propertyBindings ?? []).map((binding) => {
      const rawValue = readValue?.(binding.propCode);
      const displayValue = rawValue === undefined || rawValue === null || rawValue === "" ? "--" : String(rawValue);
      return {
        label: binding.propName || binding.propCode,
        value: displayValue === "--" || !binding.unitName ? displayValue : `${displayValue} ${binding.unitName}`,
        propCode: binding.propCode,
      };
    }),
  };
}
