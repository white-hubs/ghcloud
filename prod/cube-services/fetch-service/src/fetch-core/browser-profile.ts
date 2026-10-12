/** 与 py web-search-mcp 默认 UA 对齐，降低静态 GET 被 WAF 拦截的概率 */
export const DEFAULT_BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export function buildBrowserFetchHeaders(userAgent: string): Headers {
  const headers = new Headers();
  headers.set("User-Agent", userAgent);
  headers.set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
  headers.set("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8");
  headers.set("Cache-Control", "no-cache");
  headers.set("Upgrade-Insecure-Requests", "1");
  return headers;
}
