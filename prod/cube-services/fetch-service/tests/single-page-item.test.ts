import { describe, expect, test } from "bun:test";

import { buildSinglePageItem } from "../src/fetch-core/single-page-item";

describe("buildSinglePageItem", () => {
  test("rss feed returns one item with tag-stripped plain text", () => {
    const xml = `<?xml version="1.0"?><rss><channel><title>FreeBuf</title><item><title>A</title><link>https://a.test/1</link></item><item><title>B</title><link>https://a.test/2</link></item></channel></rss>`;
    const item = buildSinglePageItem({
      decodedBody: xml,
      contentKind: "rss",
      finalUrl: "https://www.freebuf.com/feed",
      contentType: "application/rss+xml",
    });

    expect(item.url).toBe("https://www.freebuf.com/feed");
    expect(item.title).toBe("FreeBuf");
    expect(item.content).not.toContain("<rss>");
    expect(item.content).toContain("FreeBuf");
    expect(item.content).toContain("A");
  });

  test("json returns one item with trimmed body", () => {
    const json = '{"data":[{"title":"News"}]}';
    const item = buildSinglePageItem({
      decodedBody: json,
      contentKind: "json",
      finalUrl: "https://api.test/list",
      contentType: "application/json",
    });

    expect(item.url).toBe("https://api.test/list");
    expect(item.content).toBe(json);
  });

  test("html returns one readability item", () => {
    const html = "<html><head><title>T</title></head><body><article><p>正文</p></article></body></html>";
    const item = buildSinglePageItem({
      decodedBody: html,
      contentKind: "html",
      finalUrl: "https://c.test/page",
      contentType: "text/html",
    });

    expect(item.url).toBe("https://c.test/page");
    expect(item.content).toContain("正文");
  });
});
