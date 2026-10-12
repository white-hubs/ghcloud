import { describe, expect, test } from "bun:test";

import {
  buildNormalizedContent,
  collapseWhitespace,
  previewText,
  summarizeWebFetch,
  truncateItemsForPrompt,
} from "../src/fetch-core/summarize-fetched-content";

describe("summarize-fetched-content", () => {
  test("previewText truncates with ellipsis", () => {
    expect(previewText("hello world", 5)).toBe("hello…");
  });

  test("collapseWhitespace compresses whitespace", () => {
    expect(collapseWhitespace("a\n\n  b   c")).toBe("a b c");
  });

  test("title prompt returns Title line", () => {
    const html = "<html><head><title>My Page</title></head><body>long body</body></html>";
    const result = summarizeWebFetch({
      url: "https://example.com",
      prompt: "get the title",
      normalizedContent: "My Page long body",
      rawBody: html,
      contentType: "text/html",
    });
    expect(result).toContain("Fetched https://example.com");
    expect(result).toContain("Title: My Page");
  });

  test("summary prompt returns preview up to 900 chars", () => {
    const longText = "word ".repeat(500);
    const result = summarizeWebFetch({
      url: "https://example.com",
      prompt: "summarize this page",
      normalizedContent: longText,
      rawBody: longText,
      contentType: "text/plain",
    });
    expect(result).toContain("Fetched https://example.com");
    expect(result.length).toBeLessThan(longText.length);
    expect(result.endsWith("…") || result.includes("word")).toBe(true);
  });

  test("default prompt includes Prompt and Content preview", () => {
    const result = summarizeWebFetch({
      url: "https://example.com",
      prompt: "what is on this page",
      normalizedContent: "hello content",
      rawBody: "hello content",
      contentType: "text/plain",
    });
    expect(result).toContain("Prompt: what is on this page");
    expect(result).toContain("Content preview:");
    expect(result).toContain("hello content");
  });

  test("truncateItemsForPrompt strips content for title prompt", () => {
    const items = truncateItemsForPrompt([{ title: "T", content: "very long body", url: "https://a.test" }], "title only");
    expect(items[0]?.title).toBe("T");
    expect(items[0]?.content).toBeUndefined();
    expect(items[0]?.url).toBe("https://a.test");
  });

  test("buildNormalizedContent prefers single item content", () => {
    const text = buildNormalizedContent({
      contentKind: "rss",
      decodedBody: "",
      contentType: "application/rss+xml",
      items: [{ title: "News", content: "body", url: "https://a.test/1" }],
    });
    expect(text).toBe("body");
  });
});
