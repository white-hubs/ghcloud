import dayjs from "dayjs";

export const displayText = (value?: string | number | null): string => {
  if (value == null || value === "") {
    return "--";
  }
  return String(value);
};

export const formatDateTime = (value?: string | number | null, fallback = "--"): string => {
  if (value == null || value === "") {
    return fallback;
  }
  const numeric = typeof value === "number" || /^\d+$/.test(String(value)) ? Number(value) : undefined;
  const source = numeric == null ? value : numeric < 10000000000 ? numeric * 1000 : numeric;
  const parsed = dayjs(source);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm") : fallback;
};

export const formatTime = (value?: string | number | null, fallback = "--"): string => {
  if (value == null || value === "") {
    return fallback;
  }
  const numeric = typeof value === "number" || /^\d+$/.test(String(value)) ? Number(value) : undefined;
  const source = numeric == null ? value : numeric < 10000000000 ? numeric * 1000 : numeric;
  const parsed = dayjs(source);
  return parsed.isValid() ? parsed.format("HH:mm") : fallback;
};

export const withUnit = (value?: string | number | null, unit?: string | null): string => {
  const text = displayText(value);
  return text === "--" || !unit ? text : `${text} ${unit}`;
};
