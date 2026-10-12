import { describe, expect, test } from "bun:test";

import { looksLikeHtml, normalizeRssContent } from "../src/extractors/normalize-rss-content";

describe("normalize-rss-content", () => {
  test("looksLikeHtml detects tags", () => {
    expect(looksLikeHtml("plain text")).toBe(false);
    expect(looksLikeHtml("<p>hi</p>")).toBe(true);
  });

  test("normalizeRssContent passes through plain text", () => {
    expect(normalizeRssContent("hello world")).toBe("hello world");
  });

  test("normalizeRssContent strips HTML to plain text", () => {
    expect(normalizeRssContent("<p>Hello <em>world</em></p>")).toBe("Hello world");
  });

  test("normalizeRssContent returns undefined for image-only HTML", () => {
    expect(normalizeRssContent('<img src="https://cdn.test/a.jpg">')).toBeUndefined();
  });
});
