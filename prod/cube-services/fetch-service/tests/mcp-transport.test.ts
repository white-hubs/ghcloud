import { describe, expect, test } from "bun:test";

import { toWebFetchToolResult } from "../src/transport/mcp/map-mcp-response";
import { isMcpHttpPath } from "../src/transport/mcp/mcp-http-handler";
import { createBearerAuthMiddleware } from "../src/transport/rest/fetch.controller";

describe("isMcpHttpPath", () => {
  test("matches exact path and subpaths", () => {
    expect(isMcpHttpPath("/mcp", "/mcp")).toBe(true);
    expect(isMcpHttpPath("/mcp/", "/mcp")).toBe(true);
    expect(isMcpHttpPath("/mcp/session", "/mcp")).toBe(true);
    expect(isMcpHttpPath("/fetch", "/mcp")).toBe(false);
  });
});

describe("toWebFetchToolResult", () => {
  test("maps FetchResponse to MCP tool output with result", () => {
    const payload = toWebFetchToolResult(
      {
        url: "https://example.com",
        contentKind: "html",
        totalMatched: 1,
        items: [{ title: "Hello", url: "https://example.com", content: "World" }],
        result: "Title: Hello",
      },
      "get title",
    );

    expect(payload.url).toBe("https://example.com");
    expect(payload.result).toBe("Title: Hello");
    expect(payload.contentKind).toBe("html");
    expect(payload.items).toHaveLength(1);
  });
});

describe("bearer auth middleware mcp bypass", () => {
  test("allows /mcp without bearer token when mcpHttpEnabled", async () => {
    const middleware = createBearerAuthMiddleware("secret");
    let called = false;
    await middleware(
      {
        path: "/mcp",
        request: { headers: new Headers() },
      } as never,
      async () => {
        called = true;
      },
    );
    expect(called).toBe(true);
  });
});
