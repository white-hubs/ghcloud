import { XMLParser } from "fast-xml-parser";

import type { FetchItem } from "../contracts/types";
import { normalizeRssContent } from "./normalize-rss-content";

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function readString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

function readLink(value: unknown): string | undefined {
  if (typeof value === "string") {
    return readString(value);
  }
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    return readString(record["@_href"] ?? record.href ?? record["#text"]);
  }
  return undefined;
}

function readContentValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    return readString(value);
  }
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    return readString(record["#text"] ?? record.text);
  }
  return undefined;
}

function mapRssItem(raw: Record<string, unknown>): FetchItem | undefined {
  const title = readString(raw.title ?? raw["dc:title"]);
  const guid = raw.guid;
  const guidText = typeof guid === "object" && guid !== null ? readString((guid as Record<string, unknown>)["#text"]) : readString(guid);
  const guidPermalink = typeof guid === "object" && guid !== null ? (guid as Record<string, unknown>)["@_isPermaLink"] !== "false" : true;
  const url = readString(raw.link) ?? (guidPermalink ? guidText : undefined);
  const content = normalizeRssContent(readContentValue(raw["content:encoded"]));
  const publishedAt = readString(raw.pubDate ?? raw["dc:date"]);
  const author = readString(raw["dc:creator"] ?? raw.author);

  if (!title && !content && !url) {
    return undefined;
  }

  return { title, url, content, publishedAt, author };
}

function mapAtomEntry(raw: Record<string, unknown>): FetchItem | undefined {
  const title = readString(raw.title) ?? readString(raw.summary);
  const links = asArray(raw.link);
  let url: string | undefined;
  for (const link of links) {
    const href = readLink(link);
    if (href) {
      url = href;
      break;
    }
  }
  url = url ?? readString(raw.id);
  const content = normalizeRssContent(readContentValue(raw.content) ?? readContentValue(raw.summary));
  const publishedAt = readString(raw.published ?? raw.updated);

  if (!title && !content && !url) {
    return undefined;
  }

  return { title, url, content, publishedAt };
}

export function extractRssChannelTitle(xml: string): string | undefined {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    trimValues: true,
  });

  let parsed: Record<string, unknown>;
  try {
    parsed = parser.parse(xml) as Record<string, unknown>;
  } catch {
    return undefined;
  }

  const rss = parsed.rss as Record<string, unknown> | undefined;
  if (rss?.channel) {
    return readString((rss.channel as Record<string, unknown>).title);
  }

  const feed = parsed.feed as Record<string, unknown> | undefined;
  if (feed) {
    return readString(feed.title);
  }

  return undefined;
}

export function extractRssItems(xml: string): FetchItem[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    trimValues: true,
  });

  let parsed: Record<string, unknown>;
  try {
    parsed = parser.parse(xml) as Record<string, unknown>;
  } catch {
    return [];
  }

  const rss = parsed.rss as Record<string, unknown> | undefined;
  if (rss?.channel) {
    const channel = rss.channel as Record<string, unknown>;
    const items = asArray(channel.item as Record<string, unknown> | Record<string, unknown>[] | undefined);
    return items.map((item) => mapRssItem(item)).filter((item): item is FetchItem => item !== undefined);
  }

  const feed = parsed.feed as Record<string, unknown> | undefined;
  if (feed) {
    const entries = asArray(feed.entry as Record<string, unknown> | Record<string, unknown>[] | undefined);
    return entries.map((entry) => mapAtomEntry(entry)).filter((item): item is FetchItem => item !== undefined);
  }

  const rdf = parsed["rdf:RDF"] as Record<string, unknown> | undefined;
  if (rdf?.item) {
    const items = asArray(rdf.item as Record<string, unknown> | Record<string, unknown>[] | undefined);
    return items.map((item) => mapRssItem(item)).filter((item): item is FetchItem => item !== undefined);
  }

  return [];
}
