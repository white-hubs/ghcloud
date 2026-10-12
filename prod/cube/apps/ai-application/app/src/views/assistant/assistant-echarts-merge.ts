import type { EChartsOption } from "echarts";

const CARTESIAN_SERIES_TYPES = new Set(["line", "bar", "scatter"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

export function normalizeSeriesList(series: unknown): Record<string, unknown>[] {
  if (series == null) {
    return [];
  }
  const list = Array.isArray(series) ? series : [series];
  return list.filter(isRecord).map((item) => {
    const type = typeof item.type === "string" && item.type.length > 0 ? item.type : "line";
    return { ...item, type };
  });
}

function needsCartesianLayout(series: Record<string, unknown>[]): boolean {
  return series.some((item) => CARTESIAN_SERIES_TYPES.has(String(item.type)));
}

function hasArrayData(item: Record<string, unknown>): boolean {
  return Array.isArray(item.data);
}

function extractCategoryData(user: Record<string, unknown>): string[] {
  const xAxis = user.xAxis;
  const candidates = Array.isArray(xAxis) ? xAxis : xAxis != null ? [xAxis] : [];
  for (const axis of candidates) {
    if (isRecord(axis) && Array.isArray(axis.data)) {
      return axis.data.map((item) => String(item));
    }
  }
  return [];
}

function extractYAxisName(user: Record<string, unknown>): string | undefined {
  const yAxis = user.yAxis;
  const candidates = Array.isArray(yAxis) ? yAxis : yAxis != null ? [yAxis] : [];
  for (const axis of candidates) {
    if (isRecord(axis) && typeof axis.name === "string" && axis.name.trim() !== "") {
      return axis.name;
    }
  }
  return undefined;
}

function buildCategoryLabels(user: Record<string, unknown>, series: Record<string, unknown>[]): string[] {
  const labels = extractCategoryData(user);
  let maxLen = labels.length;
  for (const item of series) {
    if (Array.isArray(item.data)) {
      maxLen = Math.max(maxLen, item.data.length);
    }
  }
  if (maxLen === 0) {
    return [];
  }
  if (labels.length >= maxLen) {
    return labels.slice(0, maxLen);
  }
  const padded = [...labels];
  for (let i = labels.length; i < maxLen; i += 1) {
    padded.push(`类目${i + 1}`);
  }
  return padded;
}

function normalizeAxisList(axis: unknown, defaultType: "category" | "value"): Record<string, unknown>[] {
  if (axis == null) {
    return [];
  }
  const list = Array.isArray(axis) ? axis : [axis];
  return list.filter(isRecord).map((item) => {
    const type = typeof item.type === "string" && item.type.length > 0 ? item.type : defaultType;
    const next: Record<string, unknown> = { ...item, type };
    delete next.gridIndex;
    delete next.gridId;
    return next;
  });
}

function unwrapAxisList(list: Record<string, unknown>[]): unknown {
  if (list.length === 0) {
    return undefined;
  }
  if (list.length === 1) {
    return list[0];
  }
  return list;
}

function unwrapSeriesList(list: Record<string, unknown>[]): Record<string, unknown>[] {
  return list;
}

function stripRiskySeriesFields(series: Record<string, unknown>[]): Record<string, unknown>[] {
  return series.map((item) => {
    const isCartesian = CARTESIAN_SERIES_TYPES.has(String(item.type));
    const next: Record<string, unknown> = { ...item };
    delete next.polarIndex;
    delete next.radiusAxisIndex;
    delete next.angleAxisIndex;
    delete next.label;
    delete next.itemStyle;
    delete next.lineStyle;
    delete next.emphasis;
    if (isCartesian) {
      if (String(item.coordinateSystem) === "polar") {
        delete next.coordinateSystem;
      }
      next.xAxisIndex = 0;
      next.yAxisIndex = 0;
      delete next.gridIndex;
    } else {
      delete next.coordinateSystem;
      delete next.xAxisIndex;
      delete next.yAxisIndex;
      delete next.gridIndex;
    }
    return next;
  });
}

function hasValidCartesianSeries(series: Record<string, unknown>[]): boolean {
  return (
    needsCartesianLayout(series) &&
    series.length > 0 &&
    series.every((item) => CARTESIAN_SERIES_TYPES.has(String(item.type)) && hasArrayData(item))
  );
}

/**
 * 将 LLM 输出的折线/柱状图重建为最小可绑定直角坐标系的 option。
 * 仅包含带 array data 的 series；无有效 series 时返回 null。
 */
export function rebuildSafeCartesianOption(
  user: Record<string, unknown>,
  series: Record<string, unknown>[],
): Record<string, unknown> | null {
  const cartesianSeries = series.filter((item) => CARTESIAN_SERIES_TYPES.has(String(item.type)) && hasArrayData(item));
  if (cartesianSeries.length === 0) {
    return null;
  }

  const xData = buildCategoryLabels(user, cartesianSeries);
  const yName = extractYAxisName(user);

  const rebuiltSeries = cartesianSeries.map((item) => {
    const next: Record<string, unknown> = {
      type: String(item.type),
      data: item.data,
    };
    if (typeof item.name === "string") {
      next.name = item.name;
    }
    return next;
  });

  const option: Record<string, unknown> = {
    grid: { left: 48, right: 24, top: 48, bottom: 48, containLabel: true },
    xAxis: { type: "category", data: xData },
    yAxis: { type: "value", ...(yName != null ? { name: yName } : {}) },
    series: unwrapSeriesList(rebuiltSeries),
  };
  if (isRecord(user.title)) {
    option.title = user.title;
  }
  return option;
}

/**
 * 官方文档最小直角坐标系结构：不手写 gridIndex / coordinateSystem，交给 ECharts 预处理器。
 */
export function buildBareCartesianOption(user: Record<string, unknown>, series: Record<string, unknown>[]): Record<string, unknown> | null {
  const cartesianSeries = series.filter((item) => CARTESIAN_SERIES_TYPES.has(String(item.type)) && hasArrayData(item));
  if (cartesianSeries.length === 0) {
    return null;
  }

  const xData = buildCategoryLabels(user, cartesianSeries);
  const yName = extractYAxisName(user);

  const option: Record<string, unknown> = {
    xAxis: { type: "category", data: xData },
    yAxis: { type: "value", ...(yName != null ? { name: yName } : {}) },
    series: cartesianSeries.map((item) => {
      const next: Record<string, unknown> = {
        type: String(item.type),
        data: item.data,
      };
      if (typeof item.name === "string") {
        next.name = item.name;
      }
      return next;
    }),
  };
  if (isRecord(user.title)) {
    option.title = user.title;
  }
  return option;
}

function optionSignature(option: Record<string, unknown>): string {
  return JSON.stringify(option);
}

export type AssistantEchartsOptionCandidate = {
  label: string;
  option: Record<string, unknown>;
};

/** 避免 Vue Proxy / 响应式对象传入 setOption */
export function toPlainEchartsOption(option: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(option)) as Record<string, unknown>;
}

/** 按成功率从高到低排列的 setOption 候选（去重） */
export function listRenderableEchartsOptionCandidates(user: Record<string, unknown>): AssistantEchartsOptionCandidate[] {
  const series = normalizeSeriesList(user.series);
  const candidates: AssistantEchartsOptionCandidate[] = [];
  const seen = new Set<string>();

  const push = (label: string, option: Record<string, unknown> | null): void => {
    if (option == null) {
      return;
    }
    const signature = optionSignature(option);
    if (seen.has(signature)) {
      return;
    }
    seen.add(signature);
    candidates.push({ label, option });
  };

  push("bare", buildBareCartesianOption(user, series));
  if (hasCartesianAxes(user) && hasValidCartesianSeries(series)) {
    push("sanitize", sanitizeAssistantEchartsOption(user, series));
  }
  push("rebuild", rebuildSafeCartesianOption(user, series));
  if (candidates.length === 0) {
    push("sanitize-fallback", sanitizeAssistantEchartsOption(user, series));
  }
  return candidates;
}

function pickSafeDataZoom(zoom: unknown): EChartsOption["dataZoom"] | undefined {
  if (zoom == null) {
    return undefined;
  }
  const list = Array.isArray(zoom) ? zoom : [zoom];
  const inside = list.filter((item) => isRecord(item) && item.type === "inside");
  if (inside.length === 0) {
    return undefined;
  }
  return inside as EChartsOption["dataZoom"];
}

function hasCartesianAxes(user: Record<string, unknown>): boolean {
  const xAxis = user.xAxis;
  const yAxis = user.yAxis;
  const hasX = xAxis != null && (Array.isArray(xAxis) ? xAxis.length > 0 : typeof xAxis === "object");
  const hasY = yAxis != null && (Array.isArray(yAxis) ? yAxis.length > 0 : typeof yAxis === "object");
  return hasX && hasY;
}

export function sanitizeAssistantEchartsOption(user: Record<string, unknown>, series: Record<string, unknown>[]): Record<string, unknown> {
  const safeSeries = stripRiskySeriesFields(series);
  const out: Record<string, unknown> = { ...user };
  delete out.dataset;
  delete out.visualMap;
  if (safeSeries.length > 0) {
    out.series = unwrapSeriesList(safeSeries);
  }

  const safeZoom = pickSafeDataZoom(user.dataZoom);
  if (safeZoom != null) {
    out.dataZoom = safeZoom;
  } else {
    delete out.dataZoom;
  }

  if (needsCartesianLayout(safeSeries)) {
    let xAxisList = normalizeAxisList(user.xAxis, "category");
    let yAxisList = normalizeAxisList(user.yAxis, "value");
    if (xAxisList.length === 0) {
      xAxisList = [{ type: "category", data: buildCategoryLabels(user, safeSeries) }];
    }
    if (yAxisList.length === 0) {
      yAxisList = [{ type: "value" }];
    }
    if (out.grid == null) {
      out.grid = { left: 48, right: 24, top: 48, bottom: 48, containLabel: true };
    }
    out.xAxis = unwrapAxisList(xAxisList);
    out.yAxis = unwrapAxisList(yAxisList);
    delete out.polar;
    delete out.angleAxis;
    delete out.radiusAxis;
  }

  return out;
}

export type AssistantEchartsMergePath = "sanitize" | "rebuild" | "sanitize-fallback";

/** 将 LLM option 规范化为可安全 setOption 的配置（首选 sanitize 路径） */
export function buildRenderableEchartsOption(user: Record<string, unknown>): Record<string, unknown> {
  const candidates = listRenderableEchartsOptionCandidates(user);
  return candidates[0]?.option ?? {};
}

/** @deprecated 测试/兼容保留；运行时请用 buildRenderableEchartsOption */
export function mergeAssistantEchartsOption(
  user: Record<string, unknown>,
): Record<string, unknown> & { __mergePath?: AssistantEchartsMergePath } {
  const candidates = listRenderableEchartsOptionCandidates(user);
  const first = candidates[0];
  return Object.assign(first?.option ?? {}, {
    __mergePath: (first?.label ?? "sanitize-fallback") as AssistantEchartsMergePath,
  });
}
