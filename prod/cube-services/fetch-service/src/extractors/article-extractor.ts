import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

import type { FetchItem } from "../contracts/types";
import { sanitizeHtmlForExtraction } from "../fetch-core/html-sanitize";
import { htmlToText } from "../fetch-core/html-to-text";
import { extractTitle } from "../fetch-core/title-extractor";
import { extractKnownArticleBody, MIN_ARTICLE_CHARS } from "./article-body-selectors";
import { extractHtmlAuthor } from "./html-author-extractor";
import { stripPageChrome } from "./html-page-chrome";
import { normalizeRssContent } from "./normalize-rss-content";

export function extractArticleFromHtml(html: string, finalUrl: string): FetchItem {
  const cleaned = sanitizeHtmlForExtraction(html);
  const { document } = parseHTML(cleaned);
  const baseElement = document.createElement("base");
  baseElement.setAttribute("href", finalUrl);
  document.head.appendChild(baseElement);

  stripPageChrome(document);

  const author = extractHtmlAuthor(html, finalUrl);
  const knownBody = extractKnownArticleBody(document);
  if (knownBody) {
    return {
      title: extractTitle(cleaned),
      url: finalUrl,
      content: normalizeRssContent(knownBody),
      author,
    };
  }

  const parsed = new Readability(document, { charThreshold: MIN_ARTICLE_CHARS }).parse();
  if (parsed) {
    const title = normalizeRssContent(parsed.title ?? undefined) ?? extractTitle(cleaned);
    const content = normalizeRssContent(parsed.textContent ?? htmlToText(parsed.content ?? ""));
    return {
      title,
      url: finalUrl,
      content,
      author,
    };
  }

  return {
    title: extractTitle(cleaned),
    url: finalUrl,
    content: normalizeRssContent(htmlToText(cleaned)),
    author,
  };
}

export function extractArticleFromText(text: string, finalUrl: string): FetchItem {
  const content = text.trim();
  return {
    url: finalUrl,
    content: content === "" ? undefined : content,
  };
}
