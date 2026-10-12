import { describe, expect, test } from "bun:test";

import { applyLimit, isSubstantiveItem } from "../src/extractors/apply-limit";
import { detectContentKind } from "../src/extractors/detect-content-kind";
import { extractJsonItems } from "../src/extractors/json-extractor";
import { extractRssItems } from "../src/extractors/rss-extractor";

describe("apply-limit", () => {
  test("filters empty items before slicing", () => {
    const result = applyLimit([{ title: "a" }, { title: " ", content: " " }, { url: "https://x.test" }, { title: "b" }], 2);
    expect(result.totalMatched).toBe(3);
    expect(result.items).toHaveLength(2);
    expect(result.items[0]?.title).toBe("a");
    expect(result.items[1]?.url).toBe("https://x.test");
  });

  test("isSubstantiveItem requires title, content, or url", () => {
    expect(isSubstantiveItem({})).toBe(false);
    expect(isSubstantiveItem({ content: "x" })).toBe(true);
  });
});

describe("extractors", () => {
  test("detectContentKind identifies rss/json/html", () => {
    expect(detectContentKind("application/rss+xml", "<rss><channel></channel></rss>")).toBe("rss");
    expect(detectContentKind("application/json", '[{"title":"a"}]')).toBe("json");
    expect(detectContentKind("text/html", "<html><body>hi</body></html>")).toBe("html");
  });

  test("extractRssItems maps RSS item fields", () => {
    const xml = `<?xml version="1.0"?><rss><channel><item><title>T1</title><link>https://a.test/1</link><description>body</description><pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate></item></channel></rss>`;
    const items = extractRssItems(xml);
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe("T1");
    expect(items[0]?.url).toBe("https://a.test/1");
    expect(items[0]?.content).toBeUndefined();
  });

  test("extractRssItems uses description only when content:encoded is absent", () => {
    const xml = `<?xml version="1.0"?><rss><channel><item><title>T1</title><link>https://a.test/1</link><description>short teaser</description></item></channel></rss>`;
    expect(extractRssItems(xml)[0]?.content).toBeUndefined();
  });

  test("extractRssItems strips HTML tags from content:encoded body", () => {
    const xml = `<?xml version="1.0"?><rss><channel><item><title>T1</title><link>https://a.test/1</link><description><![CDATA[<p>Hello <strong>world</strong></p>]]></description></item></channel></rss>`;
    expect(extractRssItems(xml)[0]?.content).toBeUndefined();
  });

  test("extractRssItems omits content when description is image-only HTML", () => {
    const xml = `<?xml version="1.0"?><rss><channel><item><title>T1</title><link>https://a.test/1</link><description><![CDATA[<img src="https://cdn.test/cover.jpg" alt="">]]></description></item></channel></rss>`;
    const items = extractRssItems(xml);
    expect(items[0]?.title).toBe("T1");
    expect(items[0]?.content).toBeUndefined();
  });

  test("extractRssItems strips HTML from content:encoded", () => {
    const xml = `<?xml version="1.0"?><rss><channel><item><title>T1</title><link>https://a.test/1</link><content:encoded><![CDATA[<div><p>Article text</p><img src="/x.png"></div>]]></content:encoded></item></channel></rss>`;
    const items = extractRssItems(xml);
    expect(items[0]?.content).toBe("Article text");
  });

  test("extractRssItems maps Atom summary to content when content is absent", () => {
    const xml = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Atom title</title><link href="https://a.test/92188" rel="alternate"/><published>2026-05-26 13:02:00</published><summary type="html">CDG文件服务器 uploadSoftWareFile 接口存在路径遍历漏洞</summary></entry></feed>`;
    const items = extractRssItems(xml);
    expect(items[0]?.title).toBe("Atom title");
    expect(items[0]?.url).toBe("https://a.test/92188");
    expect(items[0]?.content).toBe("CDG文件服务器 uploadSoftWareFile 接口存在路径遍历漏洞");
  });

  test("extractJsonItems unwraps data list", () => {
    const json = JSON.stringify({
      data: [{ title: "News", url: "https://b.test", summary: "text" }],
    });
    const items = extractJsonItems(json);
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe("News");
    expect(items[0]?.content).toBe("text");
  });

  test("extractJsonItems maps NVD CVE API vulnerabilities", () => {
    const json = JSON.stringify({
      resultsPerPage: 2,
      vulnerabilities: [
        {
          cve: {
            id: "CVE-2026-22726",
            published: "2026-05-01T00:16:23.650",
            descriptions: [
              { lang: "es", value: "Descripcion en espanol" },
              { lang: "en", value: "Route Services can be leveraged to send app traffic." },
            ],
          },
        },
        {
          cve: {
            id: "CVE-2026-22727",
            published: "2026-05-01T01:00:00.000",
            descriptions: [{ lang: "en", value: "Second vulnerability description." }],
          },
        },
      ],
    });
    const items = extractJsonItems(json);
    expect(items).toHaveLength(2);
    expect(items[0]?.title).toBe("CVE-2026-22726");
    expect(items[0]?.url).toBe("https://nvd.nist.gov/vuln/detail/CVE-2026-22726");
    expect(items[0]?.content).toBe("Route Services can be leveraged to send app traffic.");
    expect(items[0]?.publishedAt).toBe("2026-05-01T00:16:23.650");
    expect(items[1]?.title).toBe("CVE-2026-22727");
  });

  test("extractJsonItems maps CVE JSON 5.0 record shape", () => {
    const json = JSON.stringify([
      {
        dataType: "CVE_RECORD",
        cveMetadata: {
          cveId: "CVE-2024-1234",
          datePublished: "2024-01-15T10:00:00.000Z",
        },
        containers: {
          cna: {
            descriptions: [{ lang: "en", value: "Example CVE JSON 5.0 description." }],
          },
        },
      },
    ]);
    const items = extractJsonItems(json);
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe("CVE-2024-1234");
    expect(items[0]?.url).toBe("https://nvd.nist.gov/vuln/detail/CVE-2024-1234");
    expect(items[0]?.content).toBe("Example CVE JSON 5.0 description.");
    expect(items[0]?.publishedAt).toBe("2024-01-15T10:00:00.000Z");
  });
});
