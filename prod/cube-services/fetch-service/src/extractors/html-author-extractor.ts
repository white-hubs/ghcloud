/** 从 HTML 页面提取作者（Readability 不包含 byline 时的补充） */

function normalizeAuthor(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") {
    return undefined;
  }
  return trimmed;
}

function extractMetaAuthor(html: string): string | undefined {
  const patterns = [
    /<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']author["']/i,
    /<meta[^>]+property=["']article:author["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']article:author["']/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    const author = normalizeAuthor(match?.[1]);
    if (author) {
      return author;
    }
  }
  return undefined;
}

/** FreeBuf SSR：作者在 __NUXT__ IIFE 末参（post_author / nickname 变量） */
function extractFreebufNuxtAuthor(html: string): string | undefined {
  if (!html.includes("__NUXT__")) {
    return undefined;
  }
  const match = html.match(/window\.__NUXT__[\s\S]*?\}\}\([^)]*,\s*"([^"]{1,64})"\s*\)\s*<\/script>/);
  return normalizeAuthor(match?.[1]);
}

function extractJsonLdAuthor(html: string): string | undefined {
  const scripts = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (!scripts) {
    return undefined;
  }
  for (const block of scripts) {
    const inner = block.replace(/<\/?script[^>]*>/gi, "").trim();
    try {
      const parsed = JSON.parse(inner) as unknown;
      const author = readJsonLdAuthor(parsed);
      if (author) {
        return author;
      }
    } catch {
      // ignore invalid json-ld
    }
  }
  return undefined;
}

function readJsonLdAuthor(value: unknown): string | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const author = readJsonLdAuthor(item);
      if (author) {
        return author;
      }
    }
    return undefined;
  }
  const record = value as Record<string, unknown>;
  if (record.author) {
    if (typeof record.author === "string") {
      return normalizeAuthor(record.author);
    }
    if (typeof record.author === "object" && record.author !== null) {
      const name = (record.author as Record<string, unknown>).name;
      if (typeof name === "string") {
        return normalizeAuthor(name);
      }
    }
  }
  if (record["@graph"] && Array.isArray(record["@graph"])) {
    return readJsonLdAuthor(record["@graph"]);
  }
  return undefined;
}

export function extractHtmlAuthor(html: string, finalUrl?: string): string | undefined {
  const fromMeta = extractMetaAuthor(html);
  if (fromMeta) {
    return fromMeta;
  }

  const fromJsonLd = extractJsonLdAuthor(html);
  if (fromJsonLd) {
    return fromJsonLd;
  }

  if (finalUrl?.includes("freebuf.com") || html.includes("__NUXT__")) {
    const fromNuxt = extractFreebufNuxtAuthor(html);
    if (fromNuxt) {
      return fromNuxt;
    }
  }

  const classMatch = html.match(/class=["'][^"']*author[^"']*["'][^>]*>([^<]{1,64})</i);
  return normalizeAuthor(classMatch?.[1]);
}
