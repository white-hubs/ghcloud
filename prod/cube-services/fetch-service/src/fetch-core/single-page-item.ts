import type { ContentKind, FetchItem } from "../contracts/types";
import { extractArticleFromHtml, extractArticleFromText } from "../extractors/article-extractor";
import { extractRssChannelTitle } from "../extractors/rss-extractor";
import { normalizeDecodedBody } from "./content-normalizer";

/**
 * claw-code WebFetch 同款：单 URL → 单条 FetchItem。
 * HTML 使用 Readability；其余类型整页归一化为纯文本（不拆 RSS/JSON 条目）。
 */
export function buildSinglePageItem(input: {
  decodedBody: string;
  contentKind: ContentKind;
  finalUrl: string;
  contentType: string;
  pageTitle?: string;
}): FetchItem {
  const { decodedBody, contentKind, finalUrl, contentType, pageTitle } = input;

  if (contentKind === "html") {
    return extractArticleFromHtml(decodedBody, finalUrl);
  }

  if (contentKind === "text" || contentKind === "unknown") {
    return extractArticleFromText(decodedBody, finalUrl);
  }

  const title = contentKind === "rss" ? extractRssChannelTitle(decodedBody) : pageTitle;
  const content = normalizeDecodedBody(decodedBody, contentType, contentKind);

  return {
    title,
    url: finalUrl,
    content: content === "" ? undefined : content,
  };
}
