import { describe, expect, test } from "bun:test";

import { hasCompleteCategoryChartData } from "./chart-data-ready";

describe("hasCompleteCategoryChartData", () => {
  test("rejects empty axis or mismatched series length", () => {
    expect(hasCompleteCategoryChartData([], [{ data: [] }])).toBe(false);
    expect(hasCompleteCategoryChartData(["01月", "02月"], [{ data: [] }])).toBe(false);
    expect(hasCompleteCategoryChartData(["01月", "02月"], [{ data: [1] }])).toBe(false);
  });

  test("accepts axis and series with the same length, including all zeros", () => {
    expect(hasCompleteCategoryChartData(["01月", "02月"], [{ data: [0, 0] }])).toBe(true);
    expect(hasCompleteCategoryChartData(["01时"], [{ data: [12] }, { data: [] }])).toBe(true);
  });
});
