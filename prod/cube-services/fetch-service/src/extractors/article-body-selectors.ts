import { htmlToText } from "../fetch-core/html-to-text";

type ParsedDocument = ReturnType<typeof import("linkedom").parseHTML>["document"];

export const MIN_ARTICLE_CHARS = 100;

/**
 * 通用正文容器（按优先级）。
 * 不绑定域名：FreeBuf 的 #tinymce-editor、常见 CMS、schema.org 标记等统一走此列表。
 */
export const ARTICLE_BODY_SELECTORS = [
  "#tinymce-editor",
  ".content-detail",
  ".article-body",
  ".artical-body",
  ".post-content",
  ".entry-content",
  ".article-content",
  '[itemprop="articleBody"]',
  "article",
  "main",
] as const;

export function extractKnownArticleBody(document: ParsedDocument): string | undefined {
  for (const selector of ARTICLE_BODY_SELECTORS) {
    const element = document.querySelector(selector);
    if (!element) {
      continue;
    }
    const text = htmlToText(element.innerHTML).trim();
    if (text.length >= MIN_ARTICLE_CHARS) {
      return text;
    }
  }
  return undefined;
}
