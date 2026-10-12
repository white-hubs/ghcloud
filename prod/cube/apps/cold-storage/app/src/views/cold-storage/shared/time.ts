import dayjs from "dayjs";

type TimeValue = string | number | Date | null | undefined;

const emptyTexts = new Set(["", "null", "undefined", "--"]);

const normalizeTimeValue = (value: TimeValue): string | number | Date | null => {
  if (value == null) {
    return null;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return null;
    }
    return value > 10_000_000_000 ? value : value * 1000;
  }

  const text = String(value).trim();
  if (emptyTexts.has(text.toLowerCase())) {
    return null;
  }
  if (/^\d+$/.test(text)) {
    const timestamp = Number(text);
    if (!Number.isFinite(timestamp)) {
      return null;
    }
    return text.length > 10 ? timestamp : timestamp * 1000;
  }
  return text;
};

export const formatTimestamp = (value: TimeValue, pattern: string, fallback = "--"): string => {
  const normalized = normalizeTimeValue(value);
  if (normalized == null) {
    return fallback;
  }
  const parsed = dayjs(normalized);
  return parsed.isValid() ? parsed.format(pattern) : fallback;
};

export const formatDateTime = (value: TimeValue, fallback = "--"): string => formatTimestamp(value, "YYYY-MM-DD HH:mm:ss", fallback);

export const formatDate = (value: TimeValue, fallback = "--"): string => formatTimestamp(value, "YYYY-MM-DD", fallback);

export const formatClockTime = (value: TimeValue, fallback = "--"): string => {
  if (typeof value === "string") {
    const text = value.trim();
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(text)) {
      return text.length === 5 ? `${text}:00` : text;
    }
  }
  return formatTimestamp(value, "HH:mm:ss", fallback);
};
