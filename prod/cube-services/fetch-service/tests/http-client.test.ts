import { describe, expect, test } from "bun:test";

import { FetchSsrfError } from "../src/fetch-core/fetch-errors";
import { fetchUrl } from "../src/fetch-core/http-client";

describe("http-client", () => {
  test("validates DNS and fetches with the original hostname", async () => {
    let capturedUrl = "";
    let capturedHost: string | null = null;

    const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      capturedUrl = String(input);
      capturedHost = new Headers(init?.headers).get("Host");
      return new Response("<html><title>ok</title><body>hello</body></html>", {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    };

    const resolver = async () => [{ address: "93.184.216.34", family: 4 as const }];

    const result = await fetchUrl({
      url: "http://example.com/page",
      timeoutMs: 5000,
      maxRedirects: 0,
      userAgent: "test-agent",
      maxBodyBytes: 1024,
      resolver,
      fetchImpl,
    });

    expect(capturedUrl).toBe("https://example.com/page");
    expect(capturedHost).toBeNull();
    expect(result.statusCode).toBe(200);
    expect(result.finalUrl).toContain("example.com");
  });

  test("revalidates redirect target with resolver", async () => {
    const hosts: string[] = [];

    const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = new URL(String(input));
      const hostHeader = new Headers(init?.headers).get("Host") ?? url.hostname;
      hosts.push(hostHeader);

      if (hosts.length === 1) {
        return new Response("", {
          status: 302,
          headers: { Location: "https://redirect.example.com/final" },
        });
      }

      return new Response("done", {
        status: 200,
        headers: { "content-type": "text/plain" },
      });
    };

    const resolver = async (hostname: string) => {
      if (hostname === "redirect.example.com") {
        return [{ address: "1.1.1.1", family: 4 as const }];
      }
      return [{ address: "93.184.216.34", family: 4 as const }];
    };

    const result = await fetchUrl({
      url: "https://example.com/start",
      timeoutMs: 5000,
      maxRedirects: 5,
      userAgent: "test-agent",
      maxBodyBytes: 1024,
      resolver,
      fetchImpl,
    });

    expect(hosts).toEqual(["example.com", "redirect.example.com"]);
    expect(result.finalUrl).toBe("https://redirect.example.com/final");
    expect(result.statusCode).toBe(200);
  });

  test("preserves SSRF errors from DNS validation", async () => {
    await expect(
      fetchUrl({
        url: "https://example.com/start",
        timeoutMs: 5000,
        maxRedirects: 0,
        userAgent: "test-agent",
        maxBodyBytes: 1024,
        resolver: async () => {
          throw new FetchSsrfError("blocked");
        },
      }),
    ).rejects.toBeInstanceOf(FetchSsrfError);
  });

  test("preserves SSRF errors from redirect target validation", async () => {
    const fetchImpl = async (): Promise<Response> => {
      return new Response("", {
        status: 302,
        headers: { Location: "http://127.0.0.1/admin" },
      });
    };

    await expect(
      fetchUrl({
        url: "https://example.com/start",
        timeoutMs: 5000,
        maxRedirects: 1,
        userAgent: "test-agent",
        maxBodyBytes: 1024,
        resolver: async () => [{ address: "93.184.216.34", family: 4 as const }],
        fetchImpl,
      }),
    ).rejects.toBeInstanceOf(FetchSsrfError);
  });
});
