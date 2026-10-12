import { describe, expect, test } from "bun:test";

import { extractHtmlIndexItems } from "../src/extractors/html-index-extractor";

describe("html-index-extractor", () => {
  test("returns same-site list items without content on list pages", () => {
    const html = `
      <html>
        <head><title>Security Home</title></head>
        <body>
          <main>
            <article>
              <a href="/post/1"><span>AI安全网关：企业统一接入、安全防护与数据安全的必要性与实践路径</span></a>
              <time>2026-05-28 16:40:39</time>
            </article>
            <section>
              <a href="https://c.test/post/2">GitHub 被黑，3800个内部仓库外泄：从一枚恶意VS Code扩展说起</a>
              <time>2026-05-21 10:11:45</time>
            </section>
            <section>
              <a href="https://c.test/post/3">第三条资讯标题足够长以满足可用标题规则</a>
              <time>2026-05-20 10:00:00</time>
            </section>
          </main>
        </body>
      </html>
    `;
    const items = extractHtmlIndexItems(html, "https://c.test/");
    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(items.every((item) => item.content === undefined)).toBe(true);
    expect(items.every((item) => item.url?.startsWith("https://c.test/"))).toBe(true);
  });

  test("returns empty array for article detail pages", () => {
    const html = `
      <html>
        <head><title>Detail</title></head>
        <body><main><article><p>${"单篇正文".repeat(50)}</p></article></main></body>
      </html>
    `;
    const items = extractHtmlIndexItems(html, "https://c.test/articles/1.html");
    expect(items).toHaveLength(0);
  });
});
