import { htmlToText } from "../fetch-core/html-to-text";

const HTML_TAG_PATTERN = /<\/?[a-z][\w:-]*/i;

export function looksLikeHtml(text: string): boolean {
  return HTML_TAG_PATTERN.test(text);
}

/**
 * 正文字段规范化：HTML → 纯文本；不含标签/图片 URL。
 * 用于 RSS content:encoded、JSON body、结构化 articleBody 等「正文源」。
 */
export function normalizeRssContent(raw: string | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }

  const text = looksLikeHtml(raw) ? htmlToText(raw) : raw;
  const trimmed = text.replace(/\s+/g, " ").trim();
  return trimmed === "" ? undefined : trimmed;
}
