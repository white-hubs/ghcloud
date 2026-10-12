import { describe, expect, test } from "bun:test";

import { extractArticleFromHtml } from "../src/extractors/article-extractor";
import { detectBotChallenge } from "../src/fetch-core/bot-challenge-detector";

const XZ_WAF_SNIPPET = `
<textarea id="renderData" style="display:none">{"l1":"var arg1='abc123';", "l2":"GET"}</textarea>
<!doctype html><html><head><meta name="aliyun_waf_aa" content="x"><script>reload("token")</script></head><body></body></html>
`;

describe("bot-challenge-detector", () => {
  test("detects Aliyun WAF challenge page", () => {
    expect(detectBotChallenge(XZ_WAF_SNIPPET, "text/html; charset=UTF-8")).toContain("Aliyun WAF");
  });

  test("ignores normal article html", () => {
    const html = "<html><head><title>Hello</title></head><body><article><p>正文内容</p></article></body></html>";
    expect(detectBotChallenge(html, "text/html")).toBeUndefined();
  });
});

describe("article-extractor waf html", () => {
  test("does not treat hidden renderData as article title", () => {
    const item = extractArticleFromHtml(XZ_WAF_SNIPPET, "https://xz.aliyun.com/news/92100");
    expect(item.title ?? "").not.toContain("arg1");
    expect(item.content ?? "").not.toContain("arg1");
  });
});
