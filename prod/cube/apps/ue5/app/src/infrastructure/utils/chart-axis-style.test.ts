import { describe, expect, test } from "bun:test";

import { formatCategoryAxisLabel, resolveCategoryAxisLabelLayout, resolveChartGridGap } from "./chart-axis-style";

describe("formatCategoryAxisLabel", () => {
  test("keeps short labels unchanged", () => {
    expect(formatCategoryAxisLabel("烟感", 4)).toBe("烟感");
    expect(formatCategoryAxisLabel("1月", 4)).toBe("1月");
  });

  test("truncates long Chinese category names with ellipsis", () => {
    expect(formatCategoryAxisLabel("明火报警-消防通道占用", 4)).toBe("明火报警...");
  });
});

describe("resolveCategoryAxisLabelLayout", () => {
  test("four long alarm-type labels in a sidebar card rotate instead of ellipsis-truncating", () => {
    const labels = ["明火报警-消防通道占用", "烟感报警", "消防通道占用", "消防事件"];
    const layout = resolveCategoryAxisLabelLayout(labels, { chartWidth: 320, fontSize: 11 });

    expect(layout.rotate).toBe(30);
    expect(layout.hideOverlap).toBe(true);
    expect(layout.maxChars).toBeUndefined();
  });

  test("short month labels stay intact and do not rotate", () => {
    const labels = ["1月", "2月", "3月", "4月", "5月", "6月"];
    const layout = resolveCategoryAxisLabelLayout(labels, { chartWidth: 320, fontSize: 11 });

    expect(layout.rotate).toBe(0);
    expect(layout.maxChars).toBeUndefined();
    expect(layout.wrapWidth).toBeUndefined();
    expect(layout.hideOverlap).toBe(false);
  });

  test("many long category names rotate so every visible label can still be told apart", () => {
    const labels = ["明火报警-消防通道占用", "烟感报警", "消防通道占用", "消防事件", "电气火灾", "水浸报警", "燃气泄漏"];
    const layout = resolveCategoryAxisLabelLayout(labels, { chartWidth: 320, fontSize: 11 });

    expect(layout.rotate).toBe(30);
    expect(layout.hideOverlap).toBe(true);
    expect(layout.maxChars).toBeUndefined();
  });

  test("explicit rotate 0 still truncates long names in a four-bar window", () => {
    const labels = ["明火报警-消防通道占用", "烟感报警", "消防通道占用", "消防事件"];
    const layout = resolveCategoryAxisLabelLayout(labels, { rotate: 0, visibleCount: 4, chartWidth: 320, fontSize: 11 });

    expect(layout.rotate).toBe(0);
    expect(layout.overflow).toBe("truncate");
    expect(layout.maxChars).toBeLessThanOrEqual(5);
  });

  test("tiny rem-scaled fontSize still truncates long sidebar labels", () => {
    const labels = ["明火报警-消防通道占用", "烟感报警", "消防通道占用", "消防事件"];
    const layout = resolveCategoryAxisLabelLayout(labels, { rotate: 0, chartWidth: 320, fontSize: 0.9 });

    expect(layout.maxChars).toBeLessThanOrEqual(5);
    const formatted = formatCategoryAxisLabel(labels[0], layout.maxChars);
    expect(formatted.endsWith("...")).toBe(true);
    expect(formatted.length).toBeLessThan(labels[0].length);
  });
});

describe("resolveChartGridGap", () => {
  test("treats unitless numbers as px so a 24 bottom is not 24% of a tall host", () => {
    expect(resolveChartGridGap("24", 32)).toBe(32);
    expect(resolveChartGridGap("40", 32)).toBe(40);
    expect(resolveChartGridGap("10%", 32)).toBe("10%");
  });
});
