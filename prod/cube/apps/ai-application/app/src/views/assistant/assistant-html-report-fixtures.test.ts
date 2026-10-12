import { describe, expect, test } from "bun:test";

import { buildHtmlReportSrcdoc } from "./assistant-html-report";
import { parseMessageSegments } from "./assistant-message-segments";
import { ASSISTANT_HTML_REPORT_MESSAGE_FIXTURE } from "./fixtures/assistant-html-report-message.fixtures";

describe("assistant html-report fixture", () => {
  test("fixture parses to markdown intro/outro plus exactly one html-report segment", () => {
    const segments = parseMessageSegments(ASSISTANT_HTML_REPORT_MESSAGE_FIXTURE);
    const reports = segments.filter((s) => s.kind === "html-report");
    expect(reports).toHaveLength(1);
    expect(segments.filter((s) => s.kind === "markdown").length).toBeGreaterThanOrEqual(1);

    const report = reports[0];
    if (report?.kind !== "html-report") {
      throw new Error("expected an html-report segment");
    }
    expect(report.source).toContain("<style>");
    expect(report.source).toContain("<table");
    expect(report.source).toContain("经营分析");
  });

  test("fixture report body is self-contained (no external network refs in the report itself) and renders a table", () => {
    const segments = parseMessageSegments(ASSISTANT_HTML_REPORT_MESSAGE_FIXTURE);
    const report = segments.find((s) => s.kind === "html-report");
    if (report?.kind !== "html-report") {
      throw new Error("expected an html-report segment");
    }
    // 报告正文自包含：不含外链（CDN 白名单只出现在外壳 CSP，与正文内容无关）
    expect(report.source).not.toContain("http://");
    expect(report.source).not.toContain("https://");
    const srcdoc = buildHtmlReportSrcdoc(report.source);
    expect(srcdoc).toContain("<table");
  });
});
