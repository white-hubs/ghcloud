import { describe, expect, test } from "bun:test";

import { extractArticleFromHtml } from "../src/extractors/article-extractor";
import { extractHtmlAuthor } from "../src/extractors/html-author-extractor";

describe("html-author-extractor", () => {
  test("extracts meta author", () => {
    const html = '<html><head><meta name="author" content="Alice"></head><body></body></html>';
    expect(extractHtmlAuthor(html)).toBe("Alice");
  });

  test("extracts FreeBuf __NUXT__ nickname parameter", () => {
    const html = `
      <script>window.__NUXT__=function(e,t,i,n){return{data:[{serverData:{post_author:n,nickname:n}}]}}(!1,"",null,"IT熊猫")</script>
    `;
    expect(extractHtmlAuthor(html, "https://www.freebuf.com/articles/system/483968.html")).toBe("IT熊猫");
  });
});

describe("article-extractor author", () => {
  test("extractArticleFromHtml includes author from FreeBuf NUXT payload", () => {
    const html = `
      <html><head><title>SpaceX Linux</title></head><body>
        <main><article><h1>SpaceX Linux</h1><p>${"正文".repeat(30)}</p></article></main>
        <script>window.__NUXT__=function(e,t,i,n){return{data:[{serverData:{post_author:n,nickname:n}}]}}(!1,"",null,"IT熊猫")</script>
      </body></html>
    `;
    const item = extractArticleFromHtml(html, "https://www.freebuf.com/articles/system/483968.html");
    expect(item.author).toBe("IT熊猫");
    expect(item.content).toContain("正文");
  });
});
