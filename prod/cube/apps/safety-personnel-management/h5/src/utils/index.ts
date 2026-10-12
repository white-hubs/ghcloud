export function getUrlParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(params.entries());
}

export function maskPhone(phone?: string | number | null): string {
  const text = phone == null ? "" : String(phone);
  if (text.length < 7) {
    return text || "-";
  }
  return `${text.slice(0, 3)}****${text.slice(-4)}`;
}

export function getPageRecords<T>(pagination: { records?: T[]; list?: T[]; data?: T[] } | T[] | null | undefined): T[] {
  if (Array.isArray(pagination)) {
    return pagination;
  }
  return pagination?.records ?? pagination?.list ?? pagination?.data ?? [];
}

export function getPageTotal(pagination: { total?: number; totalCount?: number } | null | undefined): number {
  return pagination?.total ?? pagination?.totalCount ?? 0;
}

export function pickFirstText(...values: Array<string | number | null | undefined>): string {
  const found = values.find((v) => v !== undefined && v !== null && String(v).trim() !== "");
  return found === undefined ? "-" : String(found);
}
