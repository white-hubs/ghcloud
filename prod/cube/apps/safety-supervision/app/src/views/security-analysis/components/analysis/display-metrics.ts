import type { AnalysisMetricChart, AnalysisMetricText } from "./type";

interface DisplayMetricsConfig {
  displayType?: "chart" | "text";
  metricId?: string;
  metricName?: string;
  chartType?: string;
  groupValue?: string;
  groupValueName?: string;
  textMetrics?: TextMetricConfig[];
}

interface TextMetricConfig {
  metricId: string;
  metricName?: string;
  displayName?: string;
  valuePath?: string[];
  valueName?: string;
  displayItems?: TextMetricDisplayItem[];
}

interface TextMetricDisplayItem {
  displayName: string;
  valuePath?: string[];
  valueName?: string;
  unit?: string;
}

interface DisplayMetricSource {
  displayMetricsEnabled?: boolean;
  displayMetrics?: string;
  displayMetricResults?: Record<string, unknown>;
}

const DISPLAY_INDEX_OFFSET = 1;

const parseDisplayMetrics = (value: unknown): DisplayMetricsConfig | undefined => {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }
  try {
    return JSON.parse(value) as DisplayMetricsConfig;
  } catch {
    return undefined;
  }
};

const getNumberValue = (item: Record<string, unknown>, preferredKey?: string): number | undefined => {
  const keys = [preferredKey, "num", "rate"].filter(Boolean) as string[];
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
};

const getCategoryName = (item: Record<string, unknown>, index: number): string => {
  const name = item.name || item.marketName;
  return typeof name === "string" && name.trim() !== "" ? name : `数据${index + DISPLAY_INDEX_OFFSET}`;
};

const getMetricResultValue = (source: unknown, path: string[] = []): unknown => {
  const baseValue = Array.isArray(source) ? source[0] : source;
  if (path.length === 0) {
    return baseValue;
  }
  return path.reduce<unknown>((current, key) => {
    const value = Array.isArray(current) ? current[0] : current;
    if (value && typeof value === "object") {
      return (value as Record<string, unknown>)[key];
    }
    return undefined;
  }, baseValue);
};

const formatObjectMetricValue = (value: Record<string, unknown>): string | undefined => {
  if (typeof value.rate === "number" || (typeof value.rate === "string" && value.rate.trim() !== "")) {
    return `${value.rate}%`;
  }
  if (typeof value.num === "number" || (typeof value.num === "string" && value.num.trim() !== "")) {
    return String(value.num);
  }
  if (typeof value.value === "number" || (typeof value.value === "string" && value.value.trim() !== "")) {
    return String(value.value);
  }
  return undefined;
};

const formatMetricTextValue = (value: unknown): string => {
  if (value === undefined || value === null) {
    return "--";
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object") {
    return formatObjectMetricValue(value as Record<string, unknown>) ?? "--";
  }
  return "--";
};

const getTextMetricDisplayItems = (item: TextMetricConfig): TextMetricDisplayItem[] => {
  if (item.displayItems && item.displayItems.length > 0) {
    return item.displayItems;
  }
  return [
    {
      displayName: item.displayName ?? "",
      valuePath: item.valuePath ?? [],
      valueName: item.valueName,
      unit: "",
    },
  ];
};

export const buildDisplayMetricCharts = (source: DisplayMetricSource | undefined): AnalysisMetricChart[] => {
  if (!source?.displayMetricsEnabled) {
    return [];
  }

  const config = parseDisplayMetrics(source.displayMetrics);
  if (config?.displayType === "text") {
    return [];
  }
  const metricResults = source.displayMetricResults ?? {};
  const result = config?.metricId ? metricResults[config.metricId] : Object.values(metricResults)[0];
  if (!config || !Array.isArray(result) || result.length === 0) {
    return [];
  }

  const categories: string[] = [];
  const values: number[] = [];
  result.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      return;
    }
    const row = item as Record<string, unknown>;
    const value = getNumberValue(row, config.groupValue);
    if (value === undefined) {
      return;
    }
    categories.push(getCategoryName(row, index));
    values.push(value);
  });

  if (categories.length === 0) {
    return [];
  }

  return [
    {
      title: config.metricName || "展示指标",
      chartType: config.chartType || "verticalBar",
      categories,
      values,
      valueName: config.groupValueName || config.groupValue || "",
    },
  ];
};

export const buildDisplayMetricTexts = (source: DisplayMetricSource | undefined): AnalysisMetricText[] => {
  if (!source?.displayMetricsEnabled) {
    return [];
  }

  const config = parseDisplayMetrics(source.displayMetrics);
  if (config?.displayType !== "text") {
    return [];
  }

  const metricResults = source.displayMetricResults ?? {};
  return (config.textMetrics ?? []).flatMap((item) =>
    getTextMetricDisplayItems(item).map((displayItem) => {
      const value = getMetricResultValue(metricResults[item.metricId], displayItem.valuePath ?? []);
      const displayValue = formatMetricTextValue(value);
      return {
        label: displayItem.displayName || item.metricName || "展示指标",
        value: displayValue === "--" ? displayValue : `${displayValue}${displayItem.unit ?? ""}`,
      };
    }),
  );
};
