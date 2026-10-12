import dayjs from "dayjs";

export function formatDateTime(value: unknown): string {
  if (value === null || value === undefined || value === "") return "--";
  const text = String(value).trim();
  const numeric = Number(text);
  if (Number.isFinite(numeric) && numeric > 0) {
    return dayjs(numeric).format("YYYY-MM-DD HH:mm:ss");
  }
  const date = dayjs(text);
  return date.isValid() ? date.format("YYYY-MM-DD HH:mm:ss") : text;
}
