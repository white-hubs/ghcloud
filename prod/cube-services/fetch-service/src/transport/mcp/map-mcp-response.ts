import type { WebFetchToolResult } from "../../contracts/mcp-types";
import type { ContentKind, FetchResponse } from "../../contracts/types";
import { summarizeWebFetch, buildNormalizedContent } from "../../fetch-core/summarize-fetched-content";

function inferContentType(contentKind: ContentKind): string {
  switch (contentKind) {
    case "html":
      return "text/html";
    case "rss":
      return "application/rss+xml";
    case "json":
      return "application/json";
    case "text":
      return "text/plain";
    default:
      return "";
  }
}

export function toWebFetchToolResult(response: FetchResponse, prompt: string, rawBody?: string): WebFetchToolResult {
  const contentType = inferContentType(response.contentKind);
  const result =
    response.result ??
    summarizeWebFetch({
      url: response.url,
      prompt,
      normalizedContent: buildNormalizedContent({
        contentKind: response.contentKind,
        decodedBody: rawBody ?? response.rawBody ?? "",
        contentType,
        items: response.items,
      }),
      rawBody: rawBody ?? response.rawBody ?? "",
      contentType,
    });

  return {
    url: response.url,
    result,
    contentKind: response.contentKind,
    totalMatched: response.totalMatched,
    items: response.items,
  };
}
