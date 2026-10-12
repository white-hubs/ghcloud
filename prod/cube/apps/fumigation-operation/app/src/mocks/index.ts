import { registerAliasTableMocks } from "./alias-table.mock";
import { logger } from "@/logger";

/**
 * 无侵入 mock：通过替换 `globalThis.fetch` 劫持符合 pattern 的请求。
 * 业务代码无感知 —— 关闭 mock 后自动走真实接口，无需修改 import。
 *
 * - 仅在 `__ENV__.mock === true` 时装配（见 `src/main.ts`）
 * - 未匹配到的请求会透传给原生 fetch
 * - 针对 dev 下 Vite SPA fallback 把 `/api/**` 返回 `index.html` 的情况做了防御：
 *   若透传后拿到 `text/html`，改写为 `404 JSON`，避免下游 SDK 把 HTML 喂给 `JSON.parse` 崩溃
 * - 熏蒸作业业务接口不在前端 mock；此处仅保留 CubeTable 列配置所需的基础兜底
 */

type MockHandler = (request: Request) => Promise<unknown> | unknown;

interface MockRoute {
  method: string;
  pattern: RegExp | string;
  handler: MockHandler;
}

const mockRoutes: MockRoute[] = [];

export function registerMock(method: string, pattern: RegExp | string, handler: MockHandler): void {
  mockRoutes.push({ method: method.toUpperCase(), pattern, handler });
}

function matchRoute(route: MockRoute, req: Request, pathname: string): boolean {
  if (route.method !== req.method.toUpperCase()) {
    return false;
  }
  if (typeof route.pattern === "string") {
    return pathname.startsWith(route.pattern);
  }
  return route.pattern.test(pathname);
}

function isLikelyApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/") || pathname.startsWith("/gw-bff/") || pathname.startsWith("/bff/");
}

async function guardAgainstHtmlFallback(req: Request, resp: Response): Promise<Response> {
  const url = new URL(req.url, location.origin);
  if (!isLikelyApiPath(url.pathname)) {
    return resp;
  }
  const contentType = resp.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    return resp;
  }
  logger.warn(
    "[mock miss] API 未命中 mock 且 dev server 以 HTML 兜底，已改写为 404 JSON 以避免 JSON.parse 崩溃。",
    req.method,
    url.pathname,
    "请在 src/mocks/ 下补充对应 mock，或在 vite.dev.config.ts 配置 server.proxy 转发到真实后端。",
  );
  return new Response(
    JSON.stringify({
      errorCode: "MOCK_NOT_FOUND",
      errorMessage: `未命中 mock：${req.method} ${url.pathname}`,
    }),
    { status: 404, headers: { "Content-Type": "application/json;charset=utf-8" } },
  );
}

export function setupMocks(): void {
  registerAliasTableMocks();
  const originalFetch = globalThis.fetch.bind(globalThis);
  const mockedFetch = async function mockedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const req = new Request(input as RequestInfo, init);
    const url = new URL(req.url, location.origin);

    const matched = mockRoutes.find((route) => matchRoute(route, req, url.pathname));
    if (!matched) {
      const resp = await originalFetch(input, init);
      return guardAgainstHtmlFallback(req, resp);
    }

    try {
      const data = await matched.handler(req);
      logger.debug("[mock hit]", req.method, url.pathname, data);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json;charset=utf-8" },
      });
    } catch (error) {
      logger.error("[mock error]", req.method, url.pathname, error);
      return new Response(JSON.stringify({ errorCode: "MOCK_ERROR", errorMessage: (error as Error).message }), {
        status: 500,
        headers: { "Content-Type": "application/json;charset=utf-8" },
      });
    }
  };
  globalThis.fetch = Object.assign(mockedFetch, { preconnect: globalThis.fetch.preconnect }) as typeof fetch;
}
