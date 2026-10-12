import { describe, expect, test } from "bun:test";

import { extractArticleFromHtml } from "../src/extractors/article-extractor";

/** FreeBuf 页头/侧栏常见噪声，不应出现在正文 content 中 */
const FREEBUF_NAV_NOISE = ["主站 分类", "安全招聘", "相关推荐", "攻防演练", "知识大陆"] as const;

describe("article-extractor", () => {
  test("extractArticleFromHtml prefers main article content over aside links", () => {
    const html = `
      <html>
        <head><title>特朗普签署网络安全专项行政令 - FreeBuf</title></head>
        <body>
          <main>
            <article>
              <h1>特朗普签署网络安全专项行政令</h1>
              <p>${"这是文章正文段落，应进入 content。".repeat(20)}</p>
            </article>
          </main>
          <aside>
            <a href="https://www.csoonline.com/article/4180205/trump-revives-parts-of-canceled-ai-order.html">
              Trump revives parts of canceled AI order with cybersecurity-focused directive
            </a>
          </aside>
        </body>
      </html>
    `;
    const item = extractArticleFromHtml(html, "https://www.freebuf.com/articles/ai-security/484234.html");
    expect(item.url).toBe("https://www.freebuf.com/articles/ai-security/484234.html");
    expect(item.title).toContain("特朗普");
    expect(item.content).toContain("文章正文段落");
    expect(item.content).not.toContain("csoonline.com");
  });

  test("extractArticleFromHtml strips header nav and uses content-detail (FreeBuf-like)", () => {
    const body = "一种名为 HTTP/2 炸弹 的新型远程拒绝服务漏洞被披露。".repeat(8);
    const html = `
      <html>
        <head><title>HTTP/2 炸弹 - FreeBuf</title></head>
        <body>
          <header class="articles-layout-header">
            <div class="main-view">主站 分类 云安全 AI安全 开发安全 终端安全 数据安全 Web安全</div>
          </header>
          <aside>相关推荐 安全招聘</aside>
          <div class="artical-body">
            <div id="tinymce-editor" class="content-detail"><p>${body}</p></div>
          </div>
          <div class="content column-module">相关推荐 其他文章标题</div>
        </body>
      </html>
    `;
    const item = extractArticleFromHtml(html, "https://www.freebuf.com/articles/web/484342.html");
    expect(item.content).toContain("HTTP/2 炸弹");
    for (const noise of FREEBUF_NAV_NOISE) {
      expect(item.content).not.toContain(noise);
    }
  });

  test("extractArticleFromHtml extracts news-style FreeBuf body without chrome", () => {
    const body = "全球网安事件速递 Anthropic扩大Project Glasswing项目范围。".repeat(6);
    const html = `
      <html>
        <head><title>FreeBuf早报 - FreeBuf</title></head>
        <body>
          <header class="articles-layout-header">
            <div class="main-view">主站 分类 云安全 安全招聘</div>
          </header>
          <div class="artical-body">
            <div id="tinymce-editor" class="content-detail"><h2>全球网安事件速递</h2><p>${body}</p></div>
          </div>
          <div class="content column-module">相关推荐</div>
        </body>
      </html>
    `;
    const item = extractArticleFromHtml(html, "https://www.freebuf.com/news/484355.html");
    expect(item.content).toContain("全球网安事件速递");
    for (const noise of FREEBUF_NAV_NOISE) {
      expect(item.content).not.toContain(noise);
    }
  });
});
