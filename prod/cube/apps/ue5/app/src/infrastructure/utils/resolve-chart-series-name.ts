/** ECharts 未设置 series.name 时会生成 series0/series1，tooltip 不可读 */

const GENERIC_SERIES_NAME = /^series\d+$/i;

export const isGenericChartSeriesName = (name?: string | null): boolean => {
  const text = String(name ?? "").trim();
  return !text || GENERIC_SERIES_NAME.test(text);
};

/**
 * 解析图表系列展示名：优先业务 name，其次 titles[i] / 默认文案，永不回落 seriesN。
 */
export const resolveChartSeriesName = (
  name: string | null | undefined,
  options?: {
    index?: number;
    titles?: Array<string | null | undefined>;
    fallback?: string;
  },
): string => {
  const fallback = options?.fallback?.trim() || "数值";
  const fromName = String(name ?? "").trim();
  if (fromName && !GENERIC_SERIES_NAME.test(fromName)) {
    return fromName;
  }
  const index = options?.index ?? 0;
  const fromTitle = String(options?.titles?.[index] ?? "").trim();
  if (fromTitle && !GENERIC_SERIES_NAME.test(fromTitle)) {
    return fromTitle;
  }
  return fallback;
};
