import type { ContentKind } from "../contracts/types";

export function detectContentKind(contentType: string, bodyText: string): ContentKind {
  const normalizedType = contentType.toLowerCase();
  const trimmedBody = bodyText.trim();
  const bodyStart = trimmedBody.slice(0, 512).toLowerCase();

  if (
    normalizedType.includes("rss") ||
    normalizedType.includes("atom") ||
    normalizedType.includes("xml") ||
    bodyStart.includes("<rss") ||
    bodyStart.includes("<feed")
  ) {
    if (bodyStart.includes("<rss") || bodyStart.includes("<feed") || bodyStart.includes("<rdf:rdf")) {
      return "rss";
    }
  }

  if (normalizedType.includes("json") || normalizedType.includes("+json")) {
    return "json";
  }

  if (trimmedBody.startsWith("{") || trimmedBody.startsWith("[")) {
    try {
      JSON.parse(trimmedBody);
      return "json";
    } catch {
      // not json
    }
  }

  if (normalizedType.includes("html") || bodyStart.includes("<!doctype html") || bodyStart.includes("<html")) {
    return "html";
  }

  if (normalizedType.startsWith("text/")) {
    return "text";
  }

  if (bodyStart.includes("<rss") || bodyStart.includes("<feed")) {
    return "rss";
  }

  return "unknown";
}
