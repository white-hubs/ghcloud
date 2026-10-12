import { load, type Cheerio, type CheerioAPI } from "cheerio";

import type { FetchItem } from "../contracts/types";

const CARD_TAGS = new Set(["a", "article", "li", "section", "div", "tr"]);
const SKIPPED_LINK_PROTOCOLS = ["#", "javascript:", "mailto:", "tel:"];
const TITLE_MIN_CHARS = 8;
const MAX_CARD_TEXT_CHARS = 1800;
const MAX_ITEMS = 300;
const MIN_SAME_SITE_LIST_ITEMS = 3;
const DATE_PATTERN = /\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}(?:[ T]\d{1,2}:\d{2}(?::\d{2})?)?\b/;
type CheerioSelection = Cheerio<any>;

function cleanText(value: string | undefined): string | undefined {
  const cleaned = (value ?? "").replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
  return cleaned === "" ? undefined : cleaned;
}

function readString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return cleanText(value);
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
}

function getHostname(url: string): string | undefined {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

function isSameHostname(url: string, finalUrl: string): boolean {
  const left = getHostname(url);
  const right = getHostname(finalUrl);
  return left !== undefined && right !== undefined && left === right;
}

function resolveUrl(rawUrl: string | undefined, finalUrl: string): string | undefined {
  if (!rawUrl) {
    return undefined;
  }

  const trimmed = rawUrl.trim();
  const lowered = trimmed.toLowerCase();
  if (trimmed === "" || SKIPPED_LINK_PROTOCOLS.some((prefix) => lowered.startsWith(prefix))) {
    return undefined;
  }

  try {
    return new URL(trimmed, finalUrl).toString();
  } catch {
    return undefined;
  }
}

function readNestedString(value: unknown, keys: string[]): string | undefined {
  let current = value;
  for (const key of keys) {
    if (!isPlainObject(current)) {
      return undefined;
    }
    current = current[key];
  }
  return readString(current);
}

function mapListElement(raw: Record<string, unknown>, finalUrl: string): FetchItem | undefined {
  const nested = isPlainObject(raw.item) ? raw.item : raw;
  const title = readString(nested.name ?? nested.title ?? nested.headline);
  const url = resolveUrl(
    readString(nested.url ?? nested["@id"]) ?? readNestedString(nested, ["item", "url"]) ?? readNestedString(raw, ["url"]),
    finalUrl,
  );
  const publishedAt = readString(nested.datePublished ?? nested.dateCreated ?? nested.uploadDate);

  if (!title && !url) {
    return undefined;
  }

  return { title, url, publishedAt };
}

function collectItemListEntries(value: unknown, finalUrl: string, items: FetchItem[]): void {
  if (items.length >= MAX_ITEMS) {
    return;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      collectItemListEntries(entry, finalUrl, items);
    }
    return;
  }

  if (!isPlainObject(value)) {
    return;
  }

  const typeValue = value["@type"];
  const types = asArray(typeValue)
    .map(readString)
    .filter((item): item is string => item !== undefined)
    .map((item) => item.toLowerCase());

  if (types.includes("itemlist")) {
    for (const entry of asArray(value.itemListElement)) {
      if (isPlainObject(entry)) {
        const mapped = mapListElement(entry, finalUrl);
        if (mapped) {
          items.push(mapped);
        }
      }
    }
  }

  for (const key of ["@graph", "items"]) {
    const nested = value[key];
    if (nested !== undefined) {
      collectItemListEntries(nested, finalUrl, items);
    }
  }
}

function extractStructuredListItems($: CheerioAPI, finalUrl: string): FetchItem[] {
  const items: FetchItem[] = [];

  $('script[type*="ld+json"], script[type="application/json"]').each((_index, element) => {
    const text = cleanText($(element).text());
    if (!text) {
      return;
    }

    try {
      collectItemListEntries(JSON.parse(text), finalUrl, items);
    } catch {
      // Ignore invalid JSON-LD blocks.
    }
  });

  return dedupeItems(items.filter((item) => item.url && isSameHostname(item.url, finalUrl)));
}

function isUsableTitle(title: string): boolean {
  const compact = title.replace(/\s+/g, "");
  if (compact.length < TITLE_MIN_CHARS) {
    return false;
  }

  const hasLetterOrNumber = /[\p{L}\p{N}]/u.test(title);
  if (!hasLetterOrNumber) {
    return false;
  }

  const words = title.split(/\s+/).filter(Boolean);
  return compact.length >= 12 || words.length >= 3 || /[，。！？；：、,.!?;:]/u.test(title);
}

function findCard($: CheerioAPI, anchor: CheerioSelection): CheerioSelection {
  let current = anchor;
  let best = current;
  let bestScore = 0;

  for (let depth = 0; depth < 6 && current.length > 0; depth += 1) {
    const tag = String(current.prop("tagName") ?? "").toLowerCase();
    const text = cleanText(current.text()) ?? "";
    const textLength = text.length;
    const linkCount = current.find("a[href]").length;
    const hasTime = current.find("time,[datetime]").length > 0 || DATE_PATTERN.test(text);
    if (CARD_TAGS.has(tag) && textLength <= MAX_CARD_TEXT_CHARS && linkCount <= 20 && hasTime) {
      let score = Math.min(textLength, 400) - depth * 20 - linkCount * 15;
      if (hasTime) {
        score += 80;
      }
      if (current.find("img, picture").length > 0) {
        score += 30;
      }
      if (score > bestScore) {
        best = current;
        bestScore = score;
      }
    }
    current = current.parent();
  }

  return best;
}

function extractPublishedAt($card: CheerioSelection, cardText: string): string | undefined {
  const datetime = cleanText($card.find("time,[datetime]").first().attr("datetime"));
  if (datetime) {
    return datetime;
  }

  const timeText = cleanText($card.find("time").first().text());
  if (timeText) {
    return timeText;
  }

  const match = cardText.match(DATE_PATTERN);
  return match?.[0];
}

function extractLinkedIndexItems($: CheerioAPI, finalUrl: string): FetchItem[] {
  const items: FetchItem[] = [];

  $("a[href]").each((_index, element) => {
    const anchor = $(element);
    if (anchor.closest("nav,footer,header,aside").length > 0) {
      return;
    }

    const title = cleanText(anchor.text());
    if (!title || !isUsableTitle(title)) {
      return;
    }

    const url = resolveUrl(anchor.attr("href"), finalUrl);
    if (!url || !isSameHostname(url, finalUrl)) {
      return;
    }

    const card = findCard($, anchor);
    const cardText = cleanText(card.text()) ?? title;
    const publishedAt = extractPublishedAt(card, cardText);

    items.push({ title, url, publishedAt });
  });

  return dedupeItems(items);
}

function itemScore(item: FetchItem): number {
  return (item.title?.length ?? 0) * 2 + (item.publishedAt ? 20 : 0);
}

function dedupeItems(items: FetchItem[]): FetchItem[] {
  const seen = new Map<string, FetchItem>();
  for (const item of items) {
    const key = item.url ?? item.title;
    if (!key) {
      continue;
    }

    const previous = seen.get(key);
    if (!previous || itemScore(item) > itemScore(previous)) {
      seen.set(key, item);
    }
  }
  return [...seen.values()].slice(0, MAX_ITEMS);
}

/** HTML 索引页：仅返回同站条目列表（title/url/publishedAt），不含正文。 */
export function extractHtmlIndexItems(html: string, finalUrl: string): FetchItem[] {
  const $ = load(html);
  const structuredItems = extractStructuredListItems($, finalUrl);
  if (structuredItems.length >= MIN_SAME_SITE_LIST_ITEMS) {
    return structuredItems;
  }

  const linkedItems = extractLinkedIndexItems($, finalUrl);
  if (linkedItems.length >= MIN_SAME_SITE_LIST_ITEMS) {
    return linkedItems;
  }

  return [];
}
