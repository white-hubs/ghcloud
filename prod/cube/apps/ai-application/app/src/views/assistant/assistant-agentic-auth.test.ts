import { createAgenticClient } from "@cube-ai/agent-sdk-client-vue";
import { describe, expect, test } from "bun:test";

import { resolveAgenticEngineAuthToken } from "./assistant-agentic-auth";

describe("resolveAgenticEngineAuthToken", () => {
  test("returns trimmed raw token without Bearer prefix", () => {
    expect(resolveAgenticEngineAuthToken("  eyJhbGci  ")).toBe("eyJhbGci");
    expect(resolveAgenticEngineAuthToken("")).toBe("");
  });

  test("does not add Bearer prefix", () => {
    expect(resolveAgenticEngineAuthToken("tok-raw")).toBe("tok-raw");
    expect(resolveAgenticEngineAuthToken("tok-raw")).not.toMatch(/^Bearer /i);
  });
});

describe("agentic client auth.provider contract", () => {
  test("SDK injects single Bearer when provider returns raw token", async () => {
    let captured: RequestInit | undefined;
    const client = createAgenticClient({
      baseUrl: "http://engine.test",
      auth: { provider: () => resolveAgenticEngineAuthToken("tok-raw") },
      fetchImpl: async (_url, init) => {
        captured = init;
        return Response.json([], { status: 200 });
      },
    });

    await client.requestJson({ method: "GET", path: "/sessions" });

    const authorization = new Headers(captured!.headers as HeadersInit).get("Authorization");
    expect(authorization).toBe("Bearer tok-raw");
    expect(authorization).not.toMatch(/^Bearer Bearer /i);
  });
});
