import { describe, expect, test } from "bun:test";

import { validateFetchArticleRequest, validateFetchIndexRequest } from "../src/dto/fetch-request.dto";
import { FetchSsrfError } from "../src/fetch-core/fetch-errors";
import { FetchErrorFilter } from "../src/filters/fetch-error.filter";
import { createBearerAuthMiddleware } from "../src/transport/rest/fetch.controller";

describe("fetch-index.dto", () => {
  test("validateFetchIndexRequest accepts valid body", () => {
    const request = validateFetchIndexRequest({ url: "https://example.com/feed.xml", limit: 10 });
    expect(request.url).toBe("https://example.com/feed.xml");
    expect(request.limit).toBe(10);
  });

  test("validateFetchIndexRequest rejects missing url", () => {
    expect(() => validateFetchIndexRequest({ limit: 1 })).toThrow("url is required");
  });

  test("validateFetchIndexRequest treats null optional fields as omitted", () => {
    const request = validateFetchIndexRequest({
      url: "https://example.com",
      limit: 10,
      timeoutMs: null,
      maxRedirects: null,
    });
    expect(request.timeoutMs).toBeUndefined();
    expect(request.maxRedirects).toBeUndefined();
  });
});

describe("fetch-article.dto", () => {
  test("validateFetchArticleRequest accepts url without limit", () => {
    const request = validateFetchArticleRequest({
      url: "https://example.com/article",
      prompt: "summarize",
    });
    expect(request.url).toBe("https://example.com/article");
    expect(request.prompt).toBe("summarize");
  });

  test("validateFetchArticleRequest rejects empty prompt when provided", () => {
    expect(() => validateFetchArticleRequest({ url: "https://example.com", prompt: "  " })).toThrow("prompt must be a non-empty string");
  });
});

describe("bearer auth middleware", () => {
  test("allows /health without token", async () => {
    const middleware = createBearerAuthMiddleware("secret");
    let called = false;
    await middleware(
      {
        path: "/health",
        request: { headers: new Headers() },
      } as never,
      async () => {
        called = true;
      },
    );
    expect(called).toBe(true);
  });

  test("rejects /fetch/article without bearer token", async () => {
    const middleware = createBearerAuthMiddleware("secret");
    await expect(
      middleware(
        {
          path: "/fetch/article",
          request: { headers: new Headers() },
        } as never,
        async () => undefined,
      ),
    ).rejects.toThrow("invalid bearer token");
  });
});

describe("fetch error filter", () => {
  test("serializes fetch error code", async () => {
    const filter = new FetchErrorFilter();
    const response = filter.catch(new FetchSsrfError("blocked"), {
      setStatus: () => undefined,
      createResponse: (body: unknown, init?: ResponseInit) => {
        return new Response(JSON.stringify(body), init);
      },
    } as never);

    expect(response).toBeInstanceOf(Response);
    const body = (await response?.json()) as { code?: string; status?: number };
    expect(body.status).toBe(403);
    expect(body.code).toBe("FETCH_SSRF_BLOCKED");
  });
});
