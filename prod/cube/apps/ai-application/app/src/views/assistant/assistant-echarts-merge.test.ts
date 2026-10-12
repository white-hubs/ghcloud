import { describe, expect, test } from "bun:test";

import {
  buildBareCartesianOption,
  buildRenderableEchartsOption,
  listRenderableEchartsOptionCandidates,
  mergeAssistantEchartsOption,
  rebuildSafeCartesianOption,
} from "./assistant-echarts-merge";

describe("rebuildSafeCartesianOption", () => {
  test("rebuilds multi-line A-share style output without series.type", () => {
    const rebuilt = rebuildSafeCartesianOption(
      {
        title: { text: "近7日A股主要指数涨跌幅趋势" },
        legend: {},
        xAxis: {
          type: "category",
          data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        },
        yAxis: { type: "value", name: "涨跌幅 (%)" },
        dataZoom: [{ type: "slider" }, { type: "inside" }],
        series: [
          { name: "上证指数", data: [0.5, -0.2, 0.3, 0.1, -0.4, 0.2, 0.6] },
          { name: "深证成指", data: [0.3, 0.1, -0.1, 0.4, 0.2, -0.3, 0.5] },
          { name: "创业板指", data: [-0.1, 0.4, 0.2, -0.2, 0.3, 0.1, 0.7] },
        ],
      },
      [
        { name: "上证指数", type: "line", data: [0.5, -0.2, 0.3, 0.1, -0.4, 0.2, 0.6] },
        { name: "深证成指", type: "line", data: [0.3, 0.1, -0.1, 0.4, 0.2, -0.3, 0.5] },
        { name: "创业板指", type: "line", data: [-0.1, 0.4, 0.2, -0.2, 0.3, 0.1, 0.7] },
      ],
    );

    expect(rebuilt).not.toBeNull();
    const rebuiltOption = rebuilt!;
    const series = rebuiltOption.series as Array<Record<string, unknown>>;
    expect(series).toHaveLength(3);
    expect(series.every((s) => s.type === "line")).toBe(true);
    expect(rebuiltOption.dataZoom).toBeUndefined();
    expect((rebuiltOption.xAxis as Record<string, unknown>).gridIndex).toBeUndefined();
  });

  test("returns null when no series has array data", () => {
    const rebuilt = rebuildSafeCartesianOption({ series: [{ type: "line", datasetIndex: 0 }] }, [{ type: "line", datasetIndex: 0 }]);
    expect(rebuilt).toBeNull();
  });
});

describe("buildBareCartesianOption", () => {
  test("uses minimal xAxis/yAxis/series without gridIndex", () => {
    const bare = buildBareCartesianOption(
      {
        title: { text: "用户增长趋势（月度）" },
        xAxis: { type: "category", data: ["1月", "2月"] },
        yAxis: { type: "value" },
        series: [{ name: "活跃用户", type: "line", data: [12, 15] }],
      },
      [{ name: "活跃用户", type: "line", data: [12, 15] }],
    );
    expect(bare).not.toBeNull();
    const bareOption = bare!;
    expect(bareOption.grid).toBeUndefined();
    expect((bareOption.xAxis as Record<string, unknown>).gridIndex).toBeUndefined();
    const series = bareOption.series as Array<Record<string, unknown>>;
    expect(series[0]?.coordinateSystem).toBeUndefined();
  });
});

describe("listRenderableEchartsOptionCandidates", () => {
  test("line chart candidates prefer sanitize then bare", () => {
    const candidates = listRenderableEchartsOptionCandidates({
      title: { text: "用户增长趋势（月度）" },
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: ["1月", "2月", "3月", "4月", "5月", "6月"] },
      yAxis: { type: "value", name: "用户数（千）" },
      series: [
        { name: "活跃用户", type: "line", data: [12, 15, 18, 22, 25, 28], smooth: true },
        { name: "新增用户", type: "line", data: [3, 4, 5, 6, 5, 4], smooth: true },
      ],
    });
    expect(candidates.length).toBeGreaterThanOrEqual(2);
    expect(candidates[0]?.label).toBe("bare");
    expect(candidates.some((item) => item.label === "bare")).toBe(true);
  });
});

describe("buildRenderableEchartsOption", () => {
  test("cartesian chart bare path is default and sanitize strips polar", () => {
    const built = buildRenderableEchartsOption({
      xAxis: { type: "category", data: ["A"] },
      yAxis: { type: "value" },
      series: [{ type: "line", data: [1], polarIndex: 0, coordinateSystem: "polar" }],
    });
    expect(built.grid).toBeUndefined();
    const candidates = listRenderableEchartsOptionCandidates({
      xAxis: { type: "category", data: ["A"] },
      yAxis: { type: "value" },
      series: [{ type: "line", data: [1], polarIndex: 0, coordinateSystem: "polar" }],
    });
    const sanitize = candidates.find((item) => item.label === "sanitize")?.option;
    expect(sanitize?.grid).toBeDefined();
    const series = sanitize?.series as Array<Record<string, unknown>>;
    expect(series[0]?.xAxisIndex).toBe(0);
    expect(series[0]?.polarIndex).toBeUndefined();
    expect(
      mergeAssistantEchartsOption({
        xAxis: { type: "category", data: ["A"] },
        yAxis: { type: "value" },
        series: [{ type: "line", data: [1] }],
      }).__mergePath,
    ).toBe("bare");
  });

  test("pie chart passthrough without cartesian grid", () => {
    const built = buildRenderableEchartsOption({
      series: [{ type: "pie", data: [{ value: 1, name: "A" }] }],
    });
    expect(built.dataZoom).toBeUndefined();
    expect(built.grid).toBeUndefined();
  });
});
