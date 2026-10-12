import { describe, expect, test } from "bun:test";

import { parseMessageSegments } from "./assistant-message-segments";
import { ASSISTANT_CHART_MESSAGE_FIXTURE } from "./fixtures/assistant-chart-message.fixtures";

describe("assistant chart fixtures", () => {
  test("mixed fixture parses to markdown and two chart segments", () => {
    const segments = parseMessageSegments(ASSISTANT_CHART_MESSAGE_FIXTURE);
    expect(segments.some((s) => s.kind === "markdown")).toBe(true);
    expect(segments.filter((s) => s.kind === "chart")).toHaveLength(2);
    const chartTypes = segments.filter((s) => s.kind === "chart").map((s) => (s.kind === "chart" ? s.chartType : ""));
    expect(chartTypes).toContain("echarts");
    expect(chartTypes).toContain("mermaid");
  });
});
