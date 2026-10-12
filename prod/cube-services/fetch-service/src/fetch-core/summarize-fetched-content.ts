import type { FetchItem } from "../contracts/types";
import { htmlToText } from "./html-to-text";
import { extractTitle } from "./title-extractor";

const TITLE_PREVIEW_MAX_CHARS = 600;
const DEFAULT_PREVIEW_MAX_CHARS = 900;

export function collapseWhitespace(input: string): string {
  return input
    .split(/\s+/)
    .filter((part) => part !== "")
    .join(" ");
}

export function previewText(input: string, maxChars: number): string {
  const chars = [...input];
  if (chars.length <= maxChars) {
    return input;
  }
  return `${chars.slice(0, maxChars).join("").trimEnd()}…`;
}

function extractTitleForSummarize(normalizedContent: string, rawBody: string, contentType: string): string | undefined {
  if (contentType.toLowerCase().includes("html")) {
    const fromTag = extractTitle(rawBody);
    if (fromTag) {
      return fromTag;
    }
  }

  for (const line of normalizedContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed !== "") {
      return trimmed;
    }
  }

  return undefined;
}

/**
 * claw-code `summarize_web_fetch` 同款：按 prompt 关键词返回 Agent 友好的短文本，节省 token。
 */
export function summarizeWebFetch(input: {
  url: string;
  prompt: string;
  normalizedContent: string;
  rawBody: string;
  contentType: string;
}): string {
  const lowerPrompt = input.prompt.toLowerCase();
  const compact = collapseWhitespace(input.normalizedContent);

  let detail: string;
  if (lowerPrompt.includes("title")) {
    const title = extractTitleForSummarize(compact, input.rawBody, input.contentType);
    detail = title ? `Title: ${title}` : previewText(compact, TITLE_PREVIEW_MAX_CHARS);
  } else if (lowerPrompt.includes("summary") || lowerPrompt.includes("summarize")) {
    detail = previewText(compact, DEFAULT_PREVIEW_MAX_CHARS);
  } else {
    const preview = previewText(compact, DEFAULT_PREVIEW_MAX_CHARS);
    detail = `Prompt: ${input.prompt}\nContent preview:\n${preview}`;
  }

  return `Fetched ${input.url}\n${detail}`;
}

export function buildNormalizedContent(input: {
  contentKind: string;
  decodedBody: string;
  contentType: string;
  items: FetchItem[];
}): string {
  const itemContent = input.items[0]?.content?.trim();
  if (itemContent) {
    return itemContent;
  }

  if (input.contentKind === "html") {
    return htmlToText(input.decodedBody);
  }

  if (input.contentKind === "text" || input.contentKind === "unknown") {
    return input.decodedBody.trim();
  }

  return input.items
    .map((item) => {
      const parts: string[] = [];
      if (item.title) {
        parts.push(item.title);
      }
      if (item.content) {
        parts.push(item.content);
      }
      if (item.url) {
        parts.push(item.url);
      }
      return parts.join(" — ");
    })
    .join("\n");
}

export function truncateItemsForPrompt(items: FetchItem[], prompt: string): FetchItem[] {
  const lowerPrompt = prompt.toLowerCase();
  const maxChars = lowerPrompt.includes("title") ? TITLE_PREVIEW_MAX_CHARS : DEFAULT_PREVIEW_MAX_CHARS;

  if (lowerPrompt.includes("title")) {
    return items.map((item) => ({
      title: item.title,
      url: item.url,
      publishedAt: item.publishedAt,
    }));
  }

  return items.map((item) => ({
    ...item,
    content: item.content ? previewText(item.content, maxChars) : item.content,
  }));
}
