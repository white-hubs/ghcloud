/** 接口的时间字段可能是毫秒时间戳或日期字符串，统一成可排序的 ISO 时间。 */
export function normalizeDateTime(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const timestamp = typeof value === "number" ? value : /^\d{13}$/.test(value) ? Number(value) : Date.parse(value.replace(" ", "T"));
  if (!Number.isFinite(timestamp)) return "";
  const date = new Date(timestamp);
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
}

export function formatDateTime(value: string | number | null | undefined): string {
  const normalized = normalizeDateTime(value);
  return normalized
    ? new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
        .format(new Date(normalized))
        .replaceAll("/", "-")
    : "—";
}
export const containsKeyword = (keyword: string, values: string[]): boolean =>
  values.join(" ").toLowerCase().includes(keyword.trim().toLowerCase());
export const positiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};
export function downloadCsv(filename: string, rows: string[][]): void {
  const escape = (value: string): string => `"${(/^[=+@\-\t\r]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`;
  const blob = new Blob(["\uFEFF", rows.map((row) => row.map(escape).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
