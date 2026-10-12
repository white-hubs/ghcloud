import { describe, expect, test } from "bun:test";

import { buildHtmlReportSrcdoc, HTML_REPORT_CDN_ALLOWLIST, HTML_REPORT_IFRAME_SANDBOX, HTML_REPORT_MESSAGE } from "./assistant-html-report";

describe("HTML_REPORT_IFRAME_SANDBOX", () => {
  test("grants scripts but never allow-same-origin (guards against sandbox escape)", () => {
    const tokens = HTML_REPORT_IFRAME_SANDBOX.split(/\s+/).filter((t) => t.length > 0);
    expect(tokens).toContain("allow-scripts");
    expect(tokens).not.toContain("allow-same-origin");
  });
});

describe("HTML_REPORT_CDN_ALLOWLIST", () => {
  test("scoped to r.kaiheai.com over https only (deliberate, user-approved relaxation)", () => {
    expect(HTML_REPORT_CDN_ALLOWLIST).toEqual(["https://r.kaiheai.com"]);
    for (const host of HTML_REPORT_CDN_ALLOWLIST) {
      expect(host.startsWith("https://")).toBe(true);
    }
  });
});

function extractMetaCsp(srcdoc: string): string {
  const m = srcdoc.match(/http-equiv="Content-Security-Policy"\s+content="([^"]*)"/i);
  return m?.[1] ?? "";
}

describe("buildHtmlReportSrcdoc", () => {
  const REPORT = ["<section>", "  <style>.kpi{color:red}</style>", "  <h2>标题</h2>", "  <script>window.__x=1</script>", "</section>"].join(
    "\n",
  );

  test("wraps the report in a full html document and embeds the source verbatim", () => {
    const srcdoc = buildHtmlReportSrcdoc(REPORT);
    expect(srcdoc.trimStart().slice(0, 15).toLowerCase()).toBe("<!doctype html>");
    expect(srcdoc).toContain("</html>");
    expect(srcdoc).toContain(REPORT);
  });

  test("meta CSP matches trusted-report policy: CDN + inline + unsafe-eval, connect none", () => {
    const csp = extractMetaCsp(buildHtmlReportSrcdoc(REPORT));
    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain("script-src https://r.kaiheai.com 'unsafe-inline' 'unsafe-eval'");
    expect(csp).toContain("style-src https://r.kaiheai.com 'unsafe-inline'");
    expect(csp).toContain("img-src 'self' data: https://r.kaiheai.com");
    expect(csp).toContain("font-src https://r.kaiheai.com data:");
    expect(csp).toContain("connect-src 'none'");
    // 有意放行的 CDN 白名单（安全降级，经用户决策）——脚本/样式来源限定自有 CDN
    expect(csp).not.toContain("https://cdn.tailwindcss.com");
    expect(csp).not.toContain("https://cdn.jsdelivr.net");
    // 绝不放通配符 host，也不放明文 http 外链
    expect(csp).not.toContain("*");
    expect(csp).not.toContain("http://");
  });

  test("embeds a bridge script wiring height reporting to parent and print-on-message", () => {
    const srcdoc = buildHtmlReportSrcdoc(REPORT);
    expect(srcdoc).toContain(HTML_REPORT_MESSAGE.height);
    expect(srcdoc).toContain(HTML_REPORT_MESSAGE.print);
    expect(srcdoc).toContain("postMessage");
    expect(srcdoc).toContain("print()");
  });
});

describe("HTML_REPORT_MESSAGE", () => {
  test("exposes stable parent/child message types", () => {
    expect(HTML_REPORT_MESSAGE.height).toBe("a2-report-height");
    expect(HTML_REPORT_MESSAGE.print).toBe("a2-report-print");
  });
});
