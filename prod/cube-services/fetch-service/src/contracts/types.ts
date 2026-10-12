/** 内容类型识别结果 */
export type ContentKind = "rss" | "json" | "html" | "text" | "unknown";

/** 单条抓取结果 */
export interface FetchItem {
  title?: string;
  url?: string;
  /** 详细正文（纯文本）。索引条目通常无 content，正文走 /fetch/article。 */
  content?: string;
  publishedAt?: string;
  /** 作者（HTML meta / json-ld / 站点 SSR 等，能解析则填充） */
  author?: string;
}

export interface FetchCommonOptions {
  timeoutMs?: number;
  maxRedirects?: number;
  userAgent?: string;
  includeRaw?: boolean;
}

/** POST /fetch/index — 发现条目（RSS/JSON/HTML 列表） */
export interface FetchIndexRequest extends FetchCommonOptions {
  url: string;
  limit: number;
}

/** POST /fetch/article — 单 URL 单条正文（claw-code WebFetch 语义）；MCP web_fetch 亦走此路径 */
export interface FetchArticleRequest extends FetchCommonOptions {
  url: string;
  /** REST 可选；MCP 必填。存在时生成 claw-code 同款短 result 省 token */
  prompt?: string;
}

/** 抓取响应 */
export interface FetchResponse {
  url: string;
  contentKind: ContentKind;
  items: FetchItem[];
  totalMatched: number;
  pageTitle?: string;
  /** 传入 `prompt` 时填充；Agent/MCP 优先读此字段 */
  result?: string;
  rawBody?: string;
}
