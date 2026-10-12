const RICH_TEXT_MEDIA_TAG_PATTERN = /<(img|video|table|ul|ol|li|br)\b/i;

export const sanitizeRichText = (html: string): string =>
  html
    .replace(/<\s*(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed)\b[^>]*\/?>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, "")
    .replace(/\s+(href|src)\s*=\s*javascript:[^\s>]+/gi, "");

export const hasRichTextContent = (html?: string): boolean => {
  if (!html) {
    return false;
  }
  return (
    html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim().length > 0 || RICH_TEXT_MEDIA_TAG_PATTERN.test(html)
  );
};
