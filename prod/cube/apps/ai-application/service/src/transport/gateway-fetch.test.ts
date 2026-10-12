import { test, expect, mock } from "bun:test";

import type { CubeGateway } from "@ghcloud/cube-gateway";

import { createGatewayFetch, AI_CENTER_GATEWAY_BASE, createCubeAiClientsFromGateway } from "./gateway-fetch";

function mockCallUrl(mockFn: { mock: { calls: unknown[][] } }, callIndex = 0): string {
  const call = mockFn.mock.calls[callIndex];
  expect(call).toBeDefined();
  return (call![0] as { url: string }).url;
}

// --- 行为1: GET 请求 ---
test("GET request calls gateway.custom with method:GET and exact url", async () => {
  const mockData = [{ id: "p1", name: "Provider 1" }];
  const mockCustom = mock(async () => mockData);
  const mockGateway = { custom: mockCustom } as unknown as CubeGateway;

  const fetchImpl = createGatewayFetch(mockGateway);
  const resp = await fetchImpl("/api/ai-center/llm/providers", { method: "GET" });

  expect(mockCustom).toHaveBeenCalledWith(expect.objectContaining({ method: "GET", url: "/api/ai-center/llm/providers" }));
  expect(resp.ok).toBe(true);
  expect(await resp.json()).toEqual(mockData);
});

// --- 行为2: POST + JSON body ---
test("POST with JSON body passes parsed payload to gateway.custom", async () => {
  const mockCustom = mock(async () => ({ id: "new-provider" }));
  const mockGateway = { custom: mockCustom } as unknown as CubeGateway;
  const body = { name: "Test Provider", type: "openai" };

  const fetchImpl = createGatewayFetch(mockGateway);
  await fetchImpl("/api/ai-center/llm/providers", {
    method: "POST",
    body: JSON.stringify(body),
  });

  expect(mockCustom).toHaveBeenCalledWith(expect.objectContaining({ method: "POST", payload: body }));
});

test("POST with text/plain body passes raw markdown payload to gateway.custom", async () => {
  const mockCustom = mock(async () => ({ id: "skl_1" }));
  const mockGateway = { custom: mockCustom } as unknown as CubeGateway;
  const raw = "---\nname: reply-prefix\n---\n# Reply Prefix";

  const fetchImpl = createGatewayFetch(mockGateway);
  await fetchImpl("/api/ai-center/agent/console/skills:fromDocument", {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: raw,
  });

  expect(mockCustom).toHaveBeenCalledWith(expect.objectContaining({ method: "POST", payload: raw }));
});

test("request refreshes mutable auth before calling gateway.custom", async () => {
  const auth = { tenant: "", token: "" };
  const authSnapshots: { tenant?: string; token?: string }[] = [];
  const mockCustom = mock(async () => []);
  const mockUpdateAuth = mock((nextAuth: typeof auth) => {
    authSnapshots.push({ ...nextAuth });
  });
  const mockGateway = {
    custom: mockCustom,
    updateAuth: mockUpdateAuth,
  } as unknown as CubeGateway;

  const fetchImpl = createGatewayFetch(mockGateway, auth);

  auth.tenant = "tenant-1";
  auth.token = "token-1";
  await fetchImpl("/api/ai-center/llm/providers", { method: "GET" });

  auth.tenant = "tenant-2";
  auth.token = "token-2";
  await fetchImpl("/api/ai-center/llm/providers", { method: "GET" });

  expect(mockUpdateAuth).toHaveBeenCalledTimes(2);
  expect(authSnapshots[0]).toEqual({ tenant: "tenant-1", token: "token-1" });
  expect(authSnapshots[1]).toEqual({ tenant: "tenant-2", token: "token-2" });
  expect(mockCustom).toHaveBeenCalledTimes(2);
});

// --- 行为3: ServiceError 透传 ---
test("ServiceError thrown by gateway propagates through fetchImpl without being swallowed", async () => {
  const serviceErr = new Error("Bad Request: invalid model id");
  const mockGateway = {
    custom: mock(async () => {
      throw serviceErr;
    }),
  } as unknown as CubeGateway;

  const fetchImpl = createGatewayFetch(mockGateway);
  await expect(fetchImpl("/api/ai-center/llm/providers", { method: "GET" })).rejects.toThrow("Bad Request: invalid model id");
});

// --- 行为4: createCubeAiClients 集成——真实 SDK + mock gateway ---
// 验证 baseUrl(/api/ai-center) + SDK 管理面 pathPrefix(/llm/console) + path(/providers) 完整拼接。
test("llm.listProviders routes through gateway.custom with full URL /api/ai-center/llm/console/providers", async () => {
  const mockCustom = mock(async () => []);
  const mockGateway = { custom: mockCustom } as unknown as CubeGateway;

  const clients = createCubeAiClientsFromGateway(mockGateway);
  await clients.llm.listProviders();

  const calledUrl = mockCallUrl(mockCustom);
  expect(calledUrl).toContain("/api/ai-center");
  expect(calledUrl).toContain("/llm/console/providers");
  expect(mockCustom).toHaveBeenCalledWith(expect.objectContaining({ method: "GET" }));
});

test("llm.listProviders uses explicit runtime baseUrl when provided", async () => {
  const mockCustom = mock(async () => []);
  const mockGateway = { custom: mockCustom } as unknown as CubeGateway;

  const clients = createCubeAiClientsFromGateway(mockGateway, {
    baseUrl: "http://localhost:8890/api/ai-center/",
  });
  await clients.llm.listProviders();

  const calledUrl = mockCallUrl(mockCustom);
  expect(calledUrl).toBe("http://localhost:8890/api/ai-center/llm/console/providers");
});

test("agentConsole.listAgents routes through SDK transport with normalized base URL", async () => {
  const mockCustom = mock(async () => ({ items: [{ id: "agt_1", name: "安全助理" }] }));
  const mockGateway = { custom: mockCustom } as unknown as CubeGateway;

  const clients = createCubeAiClientsFromGateway(mockGateway);
  const agents = await clients.agentConsole.listAgents();

  expect(agents).toHaveLength(1);
  expect(agents[0]).toMatchObject({ id: "agt_1", name: "安全助理" });
  expect(mockCallUrl(mockCustom)).toBe("/api/ai-center/agent/console/agents");
  expect(mockCustom).toHaveBeenCalledWith(expect.objectContaining({ method: "GET" }));
});

test("SSE request bypasses gateway.custom and uses native fetch with auth headers", async () => {
  const sseBody = 'event: delta\ndata: {"delta":"hello"}\n\n';
  const nativeFetch = mock(async (url: string, init?: RequestInit) => {
    return new Response(sseBody, {
      status: 200,
      headers: { "content-type": "text/event-stream" },
    });
  });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = nativeFetch as typeof fetch;

  try {
    const mockCustom = mock(async () => ({}));
    const mockGateway = { custom: mockCustom } as unknown as CubeGateway;
    const fetchImpl = createGatewayFetch(mockGateway, { tenant: "7", token: "tok", terminal: 1 });

    const resp = await fetchImpl("/api/ai-center/agent/console/agents:propose", {
      method: "POST",
      headers: {
        accept: "text/event-stream",
        "content-type": "application/json",
      },
      body: JSON.stringify({ intent: "a safety agent" }),
    });

    expect(mockCustom).not.toHaveBeenCalled();
    expect(nativeFetch).toHaveBeenCalledTimes(1);
    expect(nativeFetch.mock.calls[0]?.[0]).toBe("/api/ai-center/agent/console/agents:propose");
    const headers = nativeFetch.mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer tok");
    expect(await resp.text()).toBe(sseBody);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
