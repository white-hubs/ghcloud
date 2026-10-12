import type { FetchItem } from "../contracts/types";
import { normalizeRssContent } from "./normalize-rss-content";

const WRAPPER_KEYS = ["data", "list", "items", "records", "result", "rows", "vulnerabilities", "results", "entries", "hits"] as const;

const NESTED_RECORD_KEYS = ["cve", "record", "node", "item", "entry"] as const;

const CVE_ID_PATTERN = /^CVE-\d{4}-\d+$/i;

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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (!isPlainObject(value)) {
    return [];
  }
  for (const key of WRAPPER_KEYS) {
    const nested = value[key];
    if (Array.isArray(nested)) {
      return nested;
    }
  }
  return [];
}

function flattenJsonRow(raw: Record<string, unknown>): Record<string, unknown> {
  for (const key of NESTED_RECORD_KEYS) {
    const nested = raw[key];
    if (isPlainObject(nested)) {
      return { ...raw, ...nested };
    }
  }

  const metadata = raw.cveMetadata;
  if (isPlainObject(metadata)) {
    const merged: Record<string, unknown> = { ...raw, ...metadata };
    const containers = raw.containers;
    if (isPlainObject(containers)) {
      const cna = containers.cna;
      if (isPlainObject(cna) && cna.descriptions !== undefined) {
        merged.descriptions = cna.descriptions;
      }
    }
    return merged;
  }

  return raw;
}

function readLocalizedDescription(value: unknown): string | undefined {
  if (typeof value === "string") {
    return readString(value);
  }
  if (!Array.isArray(value)) {
    return undefined;
  }

  const entries = value.filter(isPlainObject);
  const english = entries.find((entry) => readString(entry.lang)?.toLowerCase() === "en");
  const picked = english ?? entries[0];
  if (!picked) {
    return undefined;
  }

  return readString(picked.value ?? picked.description);
}

function readCveId(raw: Record<string, unknown>): string | undefined {
  return readString(raw.id ?? raw.cveId);
}

function isCveId(value: string): boolean {
  return CVE_ID_PATTERN.test(value);
}

function cveDetailUrl(cveId: string): string {
  return `https://nvd.nist.gov/vuln/detail/${cveId.toUpperCase()}`;
}

function mapJsonItem(raw: Record<string, unknown>): FetchItem | undefined {
  const flat = flattenJsonRow(raw);
  const cveId = readCveId(flat);
  const cveIdTitle = cveId && isCveId(cveId) ? cveId.toUpperCase() : undefined;

  const title = readString(flat.title ?? flat.name ?? flat.headline ?? flat.subject) ?? cveIdTitle;
  const url =
    readString(flat.url ?? flat.link ?? flat.href ?? flat.originalUrl ?? flat.sourceUrl) ??
    (cveIdTitle ? cveDetailUrl(cveIdTitle) : undefined);
  const content = normalizeRssContent(
    readLocalizedDescription(flat.descriptions) ?? readString(flat.content ?? flat.body ?? flat.text ?? flat.summary ?? flat.description),
  );
  const publishedAt = readString(
    flat.publishedAt ??
      flat.pubDate ??
      flat.publishTime ??
      flat.createdAt ??
      flat.time ??
      flat.published ??
      flat.lastModified ??
      flat.datePublished ??
      flat.dateUpdated,
  );

  if (!title && !content && !url) {
    return undefined;
  }

  return { title, url, content, publishedAt };
}

export function extractJsonItems(jsonText: string): FetchItem[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return [];
  }

  const rows = unwrapArray(parsed);
  const items: FetchItem[] = [];

  for (const row of rows) {
    if (!isPlainObject(row)) {
      continue;
    }
    const mapped = mapJsonItem(row);
    if (mapped) {
      items.push(mapped);
    }
  }

  return items;
}
