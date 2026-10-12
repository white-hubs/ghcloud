import { registerAliasTableMocks } from "./alias-table.mock";
import { logger } from "@/logger";

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
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/gw-bff/") ||
    pathname.startsWith("/bff/") ||
    pathname.startsWith("/cold-storage/") ||
    pathname.startsWith("/stores")
  );
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
  globalThis.fetch = async function mockedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
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
}
