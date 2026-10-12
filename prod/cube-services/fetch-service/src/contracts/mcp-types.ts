import type { ContentKind, FetchItem } from "./types";

/** MCP web_fetch 工具输出（Agent 优先读 result） */
export interface WebFetchToolResult {
  url: string;
  result: string;
  contentKind?: ContentKind;
  totalMatched?: number;
  items?: FetchItem[];
}

/** MCP web_fetch 工具输入（prompt 必填，单篇正文，对齐 claw-code） */
export interface WebFetchToolInput {
  url: string;
  prompt: string;
  timeoutMs?: number;
  maxRedirects?: number;
  userAgent?: string;
}
