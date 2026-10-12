const pad = (value: number): string => String(value).padStart(2, "0");

const formatFromDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

const parseToDate = (value: unknown): Date | null => {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value).trim();
  if (!text) return null;

  if (/^\d+$/.test(text)) {
    const numeric = Number(text);
    if (!Number.isFinite(numeric) || numeric <= 0) return null;
    const ms = numeric > 1e12 ? numeric : numeric * 1000;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const normalized = text.includes("T") ? text : text.replace(" ", "T");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDateTime = (value: unknown): string => {
  const date = parseToDate(value);
  if (!date) {
    if (value === null || value === undefined || value === "") return "--";
    return String(value);
  }
  return formatFromDate(date);
};

export const formatDate = (value: unknown): string => {
  const formatted = formatDateTime(value);
  if (formatted === "--") return "";
  return formatted.slice(0, 10);
};

export const formatDateTimeMinute = (value: unknown): string => {
  const formatted = formatDateTime(value);
  if (formatted === "--") return "";
  return formatted.slice(0, 16);
};

export const formatDateTimeLocal = (date = new Date()): string => {
  const pad2 = (n: number): string => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
};

export const toDateParts = (value?: string): string[] => {
  const formatted = formatDate(value);
  if (!formatted) {
    const now = new Date();
    return [String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")];
  }
  return formatted.split("-");
};

export const toDateTimeParts = (value?: string): { date: string[]; time: string[] } => {
  const formatted = formatDateTimeMinute(value) || formatDateTimeLocal();
  const [datePart, timePart = "00:00"] = formatted.split(" ");
  return {
    date: datePart.split("-"),
    time: timePart.split(":").slice(0, 2),
  };
};
