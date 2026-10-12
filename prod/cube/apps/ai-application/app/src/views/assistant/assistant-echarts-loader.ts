import * as echarts from "echarts";
import type { EChartsType } from "echarts";

const CARTESIAN_SERIES_TYPES = new Set(["line", "bar", "scatter"]);

/** 静态导入完整 ESM，避免动态 import + qiankun 下多实例/注册不一致 */
const echartsModule = echarts;

let chartRenderQueue: Promise<void> = Promise.resolve();
let preprocessorRegistered = false;

function registerAssistantEchartsPreprocessor(echartsApi: typeof echarts): void {
  if (preprocessorRegistered) {
    return;
  }
  preprocessorRegistered = true;
  echartsApi.registerPreprocessor((option) => {
    if (option == null || typeof option !== "object") {
      return;
    }
    const root = option as Record<string, unknown>;
    const seriesRaw = root.series;
    if (seriesRaw == null) {
      return;
    }
    const seriesList = Array.isArray(seriesRaw) ? seriesRaw : [seriesRaw];
    const hasCartesian = seriesList.some(
      (item) => item != null && typeof item === "object" && CARTESIAN_SERIES_TYPES.has(String((item as Record<string, unknown>).type)),
    );
    if (!hasCartesian) {
      return;
    }
    if (root.grid == null) {
      root.grid = { containLabel: true };
    }
    const attachGridIndex = (axis: unknown): unknown => {
      if (axis == null) {
        return axis;
      }
      if (Array.isArray(axis)) {
        return axis.map((item) =>
          item != null && typeof item === "object" ? { ...(item as Record<string, unknown>), gridIndex: 0 } : item,
        );
      }
      if (typeof axis === "object") {
        return { ...(axis as Record<string, unknown>), gridIndex: 0 };
      }
      return axis;
    };
    root.xAxis = attachGridIndex(root.xAxis);
    root.yAxis = attachGridIndex(root.yAxis);
    root.series = seriesList.map((item) => {
      if (item == null || typeof item !== "object") {
        return item;
      }
      const series = item as Record<string, unknown>;
      if (!CARTESIAN_SERIES_TYPES.has(String(series.type))) {
        return series;
      }
      return {
        ...series,
        coordinateSystem: "cartesian2d",
        xAxisIndex: series.xAxisIndex ?? 0,
        yAxisIndex: series.yAxisIndex ?? 0,
      };
    });
  });
}

registerAssistantEchartsPreprocessor(echartsModule);

if (import.meta.env.DEV) {
  (globalThis as { __ASSISTANT_ECHARTS__?: typeof echarts }).__ASSISTANT_ECHARTS__ = echartsModule;
}

/** 助手页多图并发 setOption 曾触发 coordinateSystem 未绑定；串行化 init/setOption */
export function enqueueAssistantChartRender<T>(task: () => Promise<T>): Promise<T> {
  const run = chartRenderQueue.then(task, task);
  chartRenderQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function loadAssistantEcharts(): Promise<typeof echarts> {
  const cartesian2dDims = echartsModule.getCoordinateSystemDimensions("cartesian2d");
  if (import.meta.env.DEV && (cartesian2dDims == null || cartesian2dDims.length === 0)) {
    console.error("[assistant-chart] cartesian2d not registered in echarts module", { cartesian2dDims });
  }
  return Promise.resolve(echartsModule);
}

const CHART_MIN_WIDTH = 320;
const CHART_MIN_HEIGHT = 280;

export function readChartContainerSize(el: HTMLElement): { width: number; height: number } {
  const width = Math.max(el.clientWidth, el.offsetWidth, CHART_MIN_WIDTH);
  const height = Math.max(el.clientHeight, el.offsetHeight, CHART_MIN_HEIGHT);
  return { width, height };
}

/** 在容器内挂载 canvas 再 init（与 headless 成功路径一致） */
export function initAssistantEcharts(el: HTMLElement, echartsApi: typeof echarts): EChartsType {
  const { width, height } = readChartContainerSize(el);
  el.replaceChildren();
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  el.appendChild(canvas);
  return echartsApi.init(canvas, undefined, { width, height, renderer: "canvas" });
}

export function waitForChartContainerSize(el: HTMLElement, onReady: (size: { width: number; height: number }) => void): () => void {
  const notify = (): boolean => {
    const width = el.clientWidth;
    const height = el.clientHeight;
    if (width > 0 && height > 0) {
      onReady({ width, height });
      return true;
    }
    return false;
  };

  if (notify()) {
    return () => {};
  }

  const observer = new ResizeObserver(() => {
    if (notify()) {
      observer.disconnect();
    }
  });
  observer.observe(el);
  return () => observer.disconnect();
}
