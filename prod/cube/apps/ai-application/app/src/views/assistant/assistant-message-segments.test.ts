import { describe, expect, test } from "bun:test";

import { formatChartFenceMarkdown, parseMessageSegments } from "./assistant-message-segments";

describe("parseMessageSegments", () => {
  test("plain markdown without fences yields a single markdown segment", () => {
    const segments = parseMessageSegments("# title\n\nhello");
    expect(segments).toEqual([{ kind: "markdown", source: "# title\n\nhello" }]);
  });

  test("unclosed echarts fence defaults to chart-pending placeholder", () => {
    const source = 'intro\n\n```echarts\n{"series":[]}';
    const segments = parseMessageSegments(source);
    expect(segments).toEqual([
      { kind: "markdown", source: "intro" },
      {
        kind: "chart-pending",
        chartType: "echarts",
      },
    ]);
  });

  test("unclosed echarts fence can stream as code block in debug mode", () => {
    const source = 'intro\n\n```echarts\n{"series":[]}';
    const segments = parseMessageSegments(source, { unclosedChartFenceMode: "code" });
    expect(segments).toEqual([
      { kind: "markdown", source: "intro" },
      {
        kind: "chart-fence",
        chartType: "echarts",
        fenceMarkdown: '```echarts\n{"series":[]}',
      },
    ]);
  });

  test("closed mermaid fence splits markdown before and after", () => {
    const source = ["before", "", "```mermaid", "flowchart TD", "  A --> B", "```", "", "after"].join("\n");
    const segments = parseMessageSegments(source);
    expect(segments).toEqual([
      { kind: "markdown", source: "before" },
      { kind: "chart", chartType: "mermaid", source: "flowchart TD\n  A --> B" },
      { kind: "markdown", source: "after" },
    ]);
  });

  test("closed echarts with valid JSON yields chart segment", () => {
    const option = { series: [{ type: "line", data: [1, 2] }] };
    const source = `\`\`\`echarts\n${JSON.stringify(option)}\n\`\`\``;
    const segments = parseMessageSegments(source);
    expect(segments).toHaveLength(1);
    expect(segments[0]).toEqual({
      kind: "chart",
      chartType: "echarts",
      source: JSON.stringify(option),
    });
  });

  test("closed echarts with formatter strings still yields chart segment after sanitizer", () => {
    const option = {
      tooltip: { trigger: "axis", formatter: "{b}: {c}%" },
      series: [{ type: "bar", data: [1, 2], label: { formatter: "{c}%" } }],
    };
    const source = `\`\`\`echarts\n${JSON.stringify(option)}\n\`\`\``;
    const segments = parseMessageSegments(source);
    expect(segments).toHaveLength(1);
    expect(segments[0]).toEqual({
      kind: "chart",
      chartType: "echarts",
      source: JSON.stringify(option),
    });
  });

  test("closed echarts with invalid JSON yields chart-fence for code block fallback", () => {
    const source = "```echarts\n{not json}\n```";
    const segments = parseMessageSegments(source);
    expect(segments).toHaveLength(1);
    expect(segments[0]).toEqual({
      kind: "chart-fence",
      chartType: "echarts",
      fenceMarkdown: formatChartFenceMarkdown("echarts", "{not json}", true),
    });
  });

  test("non-chart fences remain in markdown segments", () => {
    const source = "```typescript\nconst x = 1\n```";
    const segments = parseMessageSegments(source);
    expect(segments).toEqual([{ kind: "markdown", source }]);
  });

  test("multiple closed echarts fences yield three chart segments", () => {
    const bar = { series: [{ type: "bar", data: [1, 2] }], xAxis: { data: ["A", "B"] }, yAxis: {} };
    const line = { series: [{ type: "line", data: [3, 4] }], xAxis: { data: ["A", "B"] }, yAxis: {} };
    const pie = { series: [{ type: "pie", data: [{ value: 1, name: "A" }] }] };
    const source = [
      "intro",
      "",
      `\`\`\`echarts\n${JSON.stringify(bar)}\n\`\`\``,
      "",
      `\`\`\`echarts\n${JSON.stringify(line)}\n\`\`\``,
      "",
      `\`\`\`echarts\n${JSON.stringify(pie)}\n\`\`\``,
    ].join("\n");
    const segments = parseMessageSegments(source);
    const charts = segments.filter((s) => s.kind === "chart");
    expect(charts).toHaveLength(3);
    expect(charts.every((s) => s.kind === "chart" && s.chartType === "echarts")).toBe(true);
  });
});

describe("parseMessageSegments · html-output", () => {
  test("closed html-output fence yields an html-report segment and splits markdown", () => {
    const source = ["before", "", "```html-output", "<h1>Report</h1>", "```", "", "after"].join("\n");
    const segments = parseMessageSegments(source);
    expect(segments).toEqual([
      { kind: "markdown", source: "before" },
      { kind: "html-report", source: "<h1>Report</h1>" },
      { kind: "markdown", source: "after" },
    ]);
  });

  test("unclosed html-output fence yields html-report-pending placeholder", () => {
    const source = ["intro", "", "```html-output", "<h1>half report"].join("\n");
    const segments = parseMessageSegments(source);
    expect(segments).toEqual([{ kind: "markdown", source: "intro" }, { kind: "html-report-pending" }]);
  });

  test("html-report keeps body verbatim: outer blank lines trimmed, inner indentation and inline style/script preserved", () => {
    const inner = [
      "<section>",
      "  <style>.kpi{color:red}</style>",
      "  <h2>标题</h2>",
      "  <script>console.log(1)</script>",
      "</section>",
    ].join("\n");
    const source = ["```html-output", "", inner, "", "```"].join("\n");
    const segments = parseMessageSegments(source);
    expect(segments).toEqual([{ kind: "html-report", source: inner }]);
  });

  test("bare html fence is NOT treated as html-output and stays markdown", () => {
    const source = "```html\n<b>hi</b>\n```";
    const segments = parseMessageSegments(source);
    expect(segments).toEqual([{ kind: "markdown", source }]);
  });

  test("html-output language tag is case-insensitive", () => {
    const source = "```HTML-OUTPUT\n<p>x</p>\n```";
    const segments = parseMessageSegments(source);
    expect(segments).toEqual([{ kind: "html-report", source: "<p>x</p>" }]);
  });

  test("markdown, chart, and html-report coexist in one message", () => {
    const echarts = JSON.stringify({ series: [{ type: "line", data: [1, 2] }] });
    const source = ["开头", "", "```echarts", echarts, "```", "", "```html-output", "<h1>R</h1>", "```", "", "结尾"].join("\n");
    const segments = parseMessageSegments(source);
    expect(segments).toEqual([
      { kind: "markdown", source: "开头" },
      { kind: "chart", chartType: "echarts", source: echarts },
      { kind: "html-report", source: "<h1>R</h1>" },
      { kind: "markdown", source: "结尾" },
    ]);
  });
});
