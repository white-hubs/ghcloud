import { describe, expect, test } from "bun:test";

import { parseEchartsOption } from "./assistant-echarts-option";

describe("parseEchartsOption", () => {
  test("parses valid minimal option", () => {
    const json = '{"series":[{"type":"line","data":[1,2]}]}';
    const result = parseEchartsOption(json);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.option.series).toEqual([{ type: "line", data: [1, 2] }]);
    }
  });

  test("rejects invalid JSON", () => {
    const result = parseEchartsOption("{bad}");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message.length).toBeGreaterThan(0);
    }
  });

  test("rejects non-object root", () => {
    const result = parseEchartsOption("[1,2,3]");
    expect(result.ok).toBe(false);
  });

  test("strips formatter-like keys instead of rejecting the whole chart", () => {
    const json = JSON.stringify({
      tooltip: { trigger: "axis", formatter: "{b}: {c}%" },
      yAxis: { axisLabel: { formatter: "{value}%" } },
      series: [
        {
          type: "bar",
          data: [1, 2],
          label: { show: true, formatter: "{c}%" },
          animationDurationUpdate: 500,
        },
      ],
    });
    const result = parseEchartsOption(json);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.option).toEqual({
        tooltip: { trigger: "axis" },
        yAxis: { axisLabel: {} },
        series: [
          {
            type: "bar",
            data: [1, 2],
            label: { show: true },
          },
        ],
      });
    }
  });
});
