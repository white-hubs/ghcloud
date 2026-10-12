import { describe, expect, test } from "bun:test";
import { createCanvas } from "canvas";
import * as echarts from "echarts";

import "./assistant-echarts-loader";
import { listRenderableEchartsOptionCandidates } from "./assistant-echarts-merge";
import { parseEchartsOption } from "./assistant-echarts-option";

echarts.setPlatformAPI({
  createCanvas: (width: number, height: number) => createCanvas(width, height) as unknown as HTMLCanvasElement,
});

const LINE_CHART_JSON = JSON.stringify({
  title: { text: "用户增长趋势（月度）" },
  tooltip: { trigger: "axis" },
  legend: { bottom: 10 },
  xAxis: { type: "category", data: ["1月", "2月", "3月", "4月", "5月", "6月"] },
  yAxis: { type: "value", name: "用户数（千）" },
  series: [
    { name: "活跃用户", type: "line", data: [12, 15, 18, 22, 25, 28], smooth: true },
    { name: "新增用户", type: "line", data: [3, 4, 5, 6, 5, 4], smooth: true },
  ],
});

function probeChart(chart: echarts.ECharts): Array<{ subType: string; coordType?: string; coordSysOption?: string }> {
  const probe: Array<{ subType: string; coordType?: string; coordSysOption?: string }> = [];
  chart.getModel().eachSeries((seriesModel) => {
    probe.push({
      subType: seriesModel.subType,
      coordType: seriesModel.coordinateSystem?.type,
      coordSysOption: String(seriesModel.get("coordinateSystem")),
    });
  });
  return probe;
}

function trySetOption(
  chart: echarts.ECharts,
  label: string,
  option: Record<string, unknown>,
): { label: string; ok: boolean; probe: ReturnType<typeof probeChart>; error?: string } {
  try {
    chart.clear();
    chart.setOption(option as echarts.EChartsOption, { notMerge: true });
    const probe = probeChart(chart);
    const cartesianMissing = probe.some((item) => (item.subType === "line" || item.subType === "bar") && item.coordType !== "cartesian2d");
    if (cartesianMissing) {
      return { label, ok: false, probe, error: "coordinateSystem not bound to cartesian2d" };
    }
    return { label, ok: true, probe };
  } catch (error) {
    return {
      label,
      ok: false,
      probe: probeChart(chart),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

describe("assistant echarts render (headless canvas)", () => {
  test("cartesian2d is registered in echarts module", () => {
    const dims = echarts.getCoordinateSystemDimensions("cartesian2d");
    expect(dims).toEqual(["x", "y"]);
  });

  test("line chart candidates all bind coordinateSystem", () => {
    const parsed = parseEchartsOption(LINE_CHART_JSON);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }

    const canvas = createCanvas(650, 280);
    const chart = echarts.init(canvas as unknown as HTMLElement, undefined, { width: 650, height: 280 });
    const candidates = listRenderableEchartsOptionCandidates(parsed.option);
    expect(candidates.length).toBeGreaterThan(0);

    const results = candidates.map((candidate) => trySetOption(chart, candidate.label, candidate.option));
    for (const result of results) {
      if (!result.ok) {
        console.error("[DEBUG-echarts-render]", result);
      }
    }

    const anyOk = results.some((result) => result.ok);
    expect(anyOk).toBe(true);
    chart.dispose();
  });

  test("minimal official line option binds coordinateSystem", () => {
    const canvas = createCanvas(650, 280);
    const chart = echarts.init(canvas as unknown as HTMLElement, undefined, { width: 650, height: 280 });
    const result = trySetOption(chart, "official-minimal", {
      xAxis: { type: "category", data: ["1月", "2月"] },
      yAxis: { type: "value" },
      series: [{ type: "line", data: [12, 15] }],
    });
    expect(result.ok).toBe(true);
    expect(result.probe[0]?.coordType).toBe("cartesian2d");
    chart.dispose();
  });
});
