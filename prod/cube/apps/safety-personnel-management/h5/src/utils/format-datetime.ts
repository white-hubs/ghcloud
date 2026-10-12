import dayjs from "dayjs";

export function formatDateTime(value?: string | number | Date | null): string {
  if (value == null || value === "") {
    return "-";
  }
  const date = dayjs(value);
  return date.isValid() ? date.format("YYYY-MM-DD HH:mm") : String(value);
}

export function formatDate(value?: string | number | Date | null): string {
  if (value == null || value === "") {
    return "-";
  }
  const date = dayjs(value);
  return date.isValid() ? date.format("YYYY-MM-DD") : String(value);
}
