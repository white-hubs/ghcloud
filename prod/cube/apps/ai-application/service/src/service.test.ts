import { test, expect, mock, describe, beforeEach } from "bun:test";

import type { CubeGateway, CubeAuth } from "@ghcloud/cube-gateway";

import { CubeAiApplicationService } from "./service";
import { createCubeAiClientsFromGateway } from "./transport/gateway-fetch";

// ── fixtures ────────────────────────────────────────────────────────────────

const authMock = {} as CubeAuth;

/**
 * 满足 LlmProviderSummarySchema 的最小 mock 数据（含管理面额外字段）。
 * llm.listProviders() 会经 Zod strip；getProvider/createProvider 等方法返回 unknown，
 * 经 mock 透传，全量字段可用。
 */
const providerMock = {
  id: "42",
  providerCode: "openai",
  typeCode: "openai",
  name: "OpenAI",
  apiBaseUrl: "https://api.openai.com/v1",
  enabled: true,
  tenant: 1001,
  systemProviderId: null,
  iconUrl: null,
  apiKey: "***",
  isCustom: false,
  remark: null,
};

const modelMock = {
  id: "m1",
  providerId: "42",
  modelCode: "gpt-4o",
  displayName: "GPT-4o",
  groupName: "Chat",
  sortOrder: 1,
  remark: null,
  iconUrl: null,
  apiBaseUrl: null,
  requestSchema: null,
  responseSchema: null,
  dslSchema: null,
  systemModelId: null,
  endpointType: "openai",
  modelTypes: ["chat"],
  isFree: false,
  supportsTest: true,
};

const modelGroupMock = [{ groupName: "Chat", items: [modelMock] }];

// ── helpers ─────────────────────────────────────────────────────────────────

/**
 * 创建 URL 路由型 mock gateway：根据请求 URL 返回不同 fixture。
 * 所有 SDK 调用经 createGatewayFetch → gateway.custom 进入此函数。
 */
function makeRoutedMockGateway(routes: Record<string, unknown>, opts?: { method?: string; catchAll?: unknown }) {
  const customMock = mock(async ({ url, method }: { url: string; method: string }) => {
    if (opts?.method && method !== opts.method) {
      return opts?.catchAll ?? null;
    }
    for (const [pattern, data] of Object.entries(routes)) {
      if (url.includes(pattern)) {
        return data;
      }
    }
    return opts?.catchAll ?? null;
  });
  const mockGateway = { custom: customMock } as unknown as CubeGateway;
  return { mockGateway, customMock };
}

function makeService(mockGateway: CubeGateway) {
  const clients = createCubeAiClientsFromGateway(mockGateway);
  return new CubeAiApplicationService(authMock, { clients });
}

function mockCallUrl(mockFn: { mock: { calls: unknown[][] } }, callIndex = 0): string {
  const call = mockFn.mock.calls[callIndex];
  expect(call).toBeDefined();
  return (call![0] as { url: string }).url;
}

// ── 构造函数 ─────────────────────────────────────────────────────────────────

describe("constructor", () => {
  test("1 参调用时不抛出", () => {
    expect(() => new CubeAiApplicationService(authMock)).not.toThrow();
  });

  test("注入 clients 时使用注入的实例", async () => {
    const customMock = mock(async () => []);
    const { mockGateway } = makeRoutedMockGateway({});
    (mockGateway as unknown as { custom: typeof customMock }).custom = customMock;
    const clients = createCubeAiClientsFromGateway(mockGateway);
    const svc = new CubeAiApplicationService(authMock, { clients });
    await svc.listEndpointTypes();
    expect(customMock).toHaveBeenCalled();
  });
});

// ── listProviderTypes ────────────────────────────────────────────────────────

test("listProviderTypes: GET /api/ai-center/llm/console/provider-types", async () => {
  const data = [{ code: "openai", displayName: "OpenAI", description: null }];
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/llm/console/provider-types": data });
  const svc = makeService(mockGateway);

  const result = await svc.listProviderTypes();

  const calledUrl = mockCallUrl(customMock);
  expect(calledUrl).toContain("/llm/console/provider-types");
  expect(customMock).toHaveBeenCalledWith(expect.objectContaining({ method: "GET" }));
  expect(result).toEqual(data);
});

// ── listEndpointTypes ────────────────────────────────────────────────────────

test("listEndpointTypes: GET /api/ai-center/llm/console/endpoint-types", async () => {
  const data = [{ code: "openai", displayName: "OpenAI", description: null }];
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/llm/console/endpoint-types": data });
  const svc = makeService(mockGateway);

  const result = await svc.listEndpointTypes();

  const calledUrl = mockCallUrl(customMock);
  expect(calledUrl).toContain("/llm/console/endpoint-types");
  expect(result).toEqual(data);
});

// ── listProviders ─────────────────────────────────────────────────────────────

test("listProviders: GET /api/ai-center/llm/console/providers，返回数组", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/llm/console/providers": [providerMock],
  });
  const svc = makeService(mockGateway);

  const result = await svc.listProviders();

  const calledUrl = mockCallUrl(customMock);
  expect(calledUrl).toMatch(/\/llm\/console\/providers$/);
  expect(customMock).toHaveBeenCalledWith(expect.objectContaining({ method: "GET" }));
  expect(Array.isArray(result)).toBe(true);
  expect(result[0]?.id).toBe("42");
  expect(result[0]?.name).toBe("OpenAI");
  expect(result[0]?.enabled).toBe(true);
});

test("listProviders: apiBaseUrl 为 null 时仍返回管理面全量字段", async () => {
  const unconfigured = {
    ...providerMock,
    apiBaseUrl: null,
    apiKey: null,
    enabled: false,
  };
  const { mockGateway } = makeRoutedMockGateway({
    "/llm/console/providers": [unconfigured],
  });
  const svc = makeService(mockGateway);

  const result = await svc.listProviders();

  expect(result).toHaveLength(1);
  expect(result[0]?.apiBaseUrl).toBeNull();
  expect(result[0]?.name).toBe("OpenAI");
});

// ── getProvider ───────────────────────────────────────────────────────────────

test("getProvider: GET /api/ai-center/llm/console/providers/:id，返回完整 ProviderItem", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/llm/console/providers/42": providerMock,
  });
  const svc = makeService(mockGateway);

  const result = await svc.getProvider("42");

  const calledUrl = mockCallUrl(customMock);
  expect(calledUrl).toContain("/llm/console/providers/42");
  // getProvider 无 Zod，透传全量字段
  expect(result.id).toBe("42");
  expect(result.name).toBe("OpenAI");
  expect(result.enabled).toBe(true);
});

// ── createProvider ────────────────────────────────────────────────────────────

test("createProvider: POST /api/ai-center/llm/console/providers", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/llm/console/providers": providerMock,
  });
  const svc = makeService(mockGateway);

  const payload = {
    providerCode: "openai",
    typeCode: "openai",
    name: "OpenAI",
    apiBaseUrl: "https://api.openai.com/v1",
  };
  const result = await svc.createProvider(payload);

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toMatch(/\/llm\/console\/providers$/);
  expect(call.method).toBe("POST");
  expect(result.id).toBe("42");
});

// ── updateProvider ────────────────────────────────────────────────────────────

test("updateProvider: PUT /api/ai-center/llm/console/providers/:id", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/llm/console/providers/42": { ...providerMock, name: "OpenAI Updated" },
  });
  const svc = makeService(mockGateway);

  const result = await svc.updateProvider("42", { name: "OpenAI Updated" });

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/llm/console/providers/42");
  expect(call.method).toBe("PUT");
  expect(result.name).toBe("OpenAI Updated");
});

// ── updateProviderSettings ────────────────────────────────────────────────────

test("updateProviderSettings: PUT /api/ai-center/llm/console/providers/:id/settings", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/settings": { ...providerMock, enabled: false },
  });
  const svc = makeService(mockGateway);

  const result = await svc.updateProviderSettings("42", { enabled: false });

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/llm/console/providers/42/settings");
  expect(call.method).toBe("PUT");
  expect(result.enabled).toBe(false);
});

// ── testProviderConnection ────────────────────────────────────────────────────

test("testProviderConnection: POST /api/ai-center/llm/console/providers/:id/test-connection", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/test-connection": null,
  });
  const svc = makeService(mockGateway);

  await svc.testProviderConnection("42");

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/llm/console/providers/42/test-connection");
  expect(call.method).toBe("POST");
});

// ── testModelConnection（名异：→ SDK testModel）──────────────────────────────

test("testModelConnection: POST …/providers/:id/models/:modelId/test（名异映射）", async () => {
  const detectionResult = {
    ok: true,
    message: "OK",
    modelId: "m1",
    modelCode: "gpt-4o",
    supportsTest: true,
  };
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/models/m1/test": detectionResult,
  });
  const svc = makeService(mockGateway);

  const result = await svc.testModelConnection("42", "m1");

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/llm/console/providers/42/models/m1/test");
  expect(call.method).toBe("POST");
  // DTO 字段：ok / message / modelId / modelCode / supportsTest
  expect(result.ok).toBe(true);
  expect(result.modelCode).toBe("gpt-4o");
  expect(result.supportsTest).toBe(true);
});

// ── deleteProvider ────────────────────────────────────────────────────────────

test("deleteProvider: DELETE /api/ai-center/llm/console/providers/:id", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/llm/console/providers/42": null,
  });
  const svc = makeService(mockGateway);

  await svc.deleteProvider("42");

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/llm/console/providers/42");
  expect(call.method).toBe("DELETE");
});

// ── listModelGroups（名异：→ SDK listModels）──────────────────────────────────

test("listModelGroups: GET …/providers/:id/models，返回 ModelGroupItem[] 形状", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/providers/42/models": modelGroupMock,
  });
  const svc = makeService(mockGateway);

  const result = await svc.listModelGroups("42");

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  // URL 应以 /models 结尾（不含子路径）
  expect(call.url).toMatch(/\/llm\/console\/providers\/42\/models$/);
  expect(call.method).toBe("GET");
  // 验证 ModelGroupItem[] 形状
  expect(result[0]?.groupName).toBe("Chat");
  expect(Array.isArray(result[0]?.items)).toBe(true);
  expect(result[0]?.items[0]?.modelCode).toBe("gpt-4o");
});

// ── createModel ───────────────────────────────────────────────────────────────

test("createModel: POST /api/ai-center/llm/console/providers/:id/models", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/providers/42/models": modelMock,
  });
  const svc = makeService(mockGateway);

  const result = await svc.createModel("42", { modelCode: "gpt-4o", displayName: "GPT-4o" });

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toMatch(/\/llm\/console\/providers\/42\/models$/);
  expect(call.method).toBe("POST");
  expect(result.id).toBe("m1");
  expect(result.modelCode).toBe("gpt-4o");
});

// ── updateModel ───────────────────────────────────────────────────────────────

test("updateModel: PUT /api/ai-center/llm/console/providers/:id/models/:modelId", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/models/m1": { ...modelMock, displayName: "GPT-4o Updated" },
  });
  const svc = makeService(mockGateway);

  const result = await svc.updateModel("42", "m1", {
    modelCode: "gpt-4o",
    displayName: "GPT-4o Updated",
  });

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/llm/console/providers/42/models/m1");
  expect(call.method).toBe("PUT");
  expect(result.displayName).toBe("GPT-4o Updated");
});

// ── deleteModel ───────────────────────────────────────────────────────────────

test("deleteModel: DELETE /api/ai-center/llm/console/providers/:id/models/:modelId", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/models/m1": null,
  });
  const svc = makeService(mockGateway);

  await svc.deleteModel("42", "m1");

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/llm/console/providers/42/models/m1");
  expect(call.method).toBe("DELETE");
});

// ── fetchRemoteModels（名异：→ SDK fetchRemote）──────────────────────────────

test("fetchRemoteModels: POST …/models/fetch-remote（名异映射）", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/fetch-remote": { synced: 5 },
  });
  const svc = makeService(mockGateway);

  const result = await svc.fetchRemoteModels("42");

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/llm/console/providers/42/models/fetch-remote");
  // 确认不含 fetch-remote-preview（路由歧义检查）
  expect(call.url).not.toContain("fetch-remote-preview");
  expect(call.method).toBe("POST");
  expect(result.synced).toBe(5);
});

// ── previewRemoteModels（名异：→ SDK fetchRemotePreview）─────────────────────

test("previewRemoteModels: POST …/models/fetch-remote-preview（名异映射）", async () => {
  const candidate = {
    modelCode: "gpt-4-turbo",
    displayName: "GPT-4 Turbo",
    groupName: "Chat",
    iconUrl: "",
    apiBaseUrl: null,
    requestSchema: null,
    responseSchema: null,
    dslSchema: null,
    endpointType: "openai",
    modelTypes: ["chat"],
    isFree: false,
    supportsTest: true,
    matchedBy: "system-model" as const,
    systemModelId: null,
    alreadyAdded: false,
  };
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/fetch-remote-preview": [candidate],
  });
  const svc = makeService(mockGateway);

  const result = await svc.previewRemoteModels("42");

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/llm/console/providers/42/models/fetch-remote-preview");
  expect(call.method).toBe("POST");
  // RemoteModelCandidate 关键字段
  expect(result[0]?.modelCode).toBe("gpt-4-turbo");
  expect(result[0]?.matchedBy).toBe("system-model");
  expect(result[0]?.alreadyAdded).toBe(false);
});

// ── importRemoteModels（名异 + body 结构：→ SDK importRemote）────────────────

test("importRemoteModels: POST …/models/import-remote，body 含 modelCodes + endpointType（名异映射）", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/import-remote": { imported: 3 },
  });
  const svc = makeService(mockGateway);

  const result = await svc.importRemoteModels("42", ["gpt-4o", "gpt-3.5"], "openai");

  const call = customMock.mock.calls[0]?.[0] as {
    url: string;
    method: string;
    payload: Record<string, unknown>;
  };
  expect(call.url).toContain("/llm/console/providers/42/models/import-remote");
  expect(call.method).toBe("POST");
  // 验证 body 结构：facade (modelCodes, endpointType?) → SDK { modelCodes, endpointType }
  expect(call.payload).toEqual({ modelCodes: ["gpt-4o", "gpt-3.5"], endpointType: "openai" });
  expect(result.imported).toBe(3);
});

test("importRemoteModels: endpointType 可省略（undefined）", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/import-remote": { imported: 1 },
  });
  const svc = makeService(mockGateway);

  await svc.importRemoteModels("42", ["gpt-4o"]);

  const call = customMock.mock.calls[0]?.[0] as { payload: Record<string, unknown> };
  expect(call.payload).toEqual({ modelCodes: ["gpt-4o"], endpointType: undefined });
});

// ── listTenantModels（组合方法）───────────────────────────────────────────────

test("listTenantModels: 聚合 enabled providers × models，按 providerName→sortOrder→modelCode 排序", async () => {
  const provider2 = {
    ...providerMock,
    id: "99",
    providerCode: "anthropic",
    typeCode: "anthropic",
    name: "Anthropic",
  };
  const modelB = {
    ...modelMock,
    id: "m2",
    providerId: "99",
    modelCode: "claude-3",
    displayName: "Claude 3",
    groupName: "Chat",
    sortOrder: 1,
  };
  const groupB = [{ groupName: "Chat", items: [modelB] }];

  // mock: GET /providers → 两个 provider; GET /providers/:id/models → 对应 groups
  const customMock = mock(async ({ url, method }: { url: string; method: string }) => {
    if (method === "GET" && url.endsWith("/providers")) {
      return [providerMock, provider2];
    }
    if (method === "GET" && url.includes("/providers/42/models")) {
      return modelGroupMock;
    }
    if (method === "GET" && url.includes("/providers/99/models")) {
      return groupB;
    }
    return null;
  });
  const mockGateway = { custom: customMock } as unknown as CubeGateway;
  const svc = makeService(mockGateway);

  const models = await svc.listTenantModels();

  // 排序：Anthropic < OpenAI（字母序）
  expect(models[0]?.modelCode).toBe("claude-3");
  expect(models[1]?.modelCode).toBe("gpt-4o");
  // ModelItem 关键字段完整
  expect(models[0]?.id).toBe("m2");
  expect(models[0]?.groupName).toBe("Chat");
  expect(models[0]?.supportsTest).toBe(true);
});

test("listTenantModels: 过滤 enabled=false 的 provider", async () => {
  const disabledProvider = { ...providerMock, id: "77", enabled: false };
  const customMock = mock(async ({ url, method }: { url: string; method: string }) => {
    if (method === "GET" && url.endsWith("/providers")) {
      return [providerMock, disabledProvider];
    }
    if (method === "GET" && url.includes("/providers/42/models")) {
      return modelGroupMock;
    }
    return null;
  });
  const mockGateway = { custom: customMock } as unknown as CubeGateway;
  const svc = makeService(mockGateway);

  const models = await svc.listTenantModels();

  // disabled provider 的模型不参与结果
  expect(models.every((m) => m.providerId !== "77")).toBe(true);
  expect(models.length).toBe(1);
  expect(models[0]?.providerId).toBe("42");
});

// ── flow fixtures ──────────────────────────────────────────────────────────────

const editorFlowJsonMock = {
  schemaVersion: "1.0",
  nodes: [{ id: "n1", componentKey: "llm-node", label: "LLM" }],
  edges: [],
};

const flowSummaryMock = {
  id: "flow1",
  tenant: 1001,
  name: "Test Flow",
  description: null,
  compileStatus: "compiled",
  compileError: null,
  compileRevision: "rev1",
  publishedReleaseId: null,
  publishedRevision: null,
  enabled: true,
  remark: null,
  createTime: 1_000_000,
  updateTime: 1_000_001,
};

const flowDetailMock = {
  ...flowSummaryMock,
  editorFlowJson: editorFlowJsonMock,
  compiledFlowJson: null,
  componentSnapshotJson: null,
  remoteFlowId: null,
  remoteBindingStatus: null,
  lastCompiledTime: null,
  lastSyncedTime: null,
  references: [],
};

const flowComponentMock = {
  id: "comp1",
  componentKey: "llm-node",
  componentName: "LLM Node",
  componentGroup: "AI",
  componentType: "action",
  componentVersion: "1.0",
  mappingType: "direct",
  mappingTarget: null,
  iconUrl: null,
  enabled: true,
  isBuiltin: true,
  presentationSchema: null,
  protocolSchema: null,
  executionPolicy: null,
};

// ── listFlowComponents ────────────────────────────────────────────────────────

test("listFlowComponents: GET /api/ai-center/flow/console/studio/components", async () => {
  const data = [flowComponentMock];
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/flow/console/studio/components": data });
  const svc = makeService(mockGateway);

  const result = await svc.listFlowComponents();

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/flow/console/studio/components");
  expect(call.method).toBe("GET");
  expect(result[0]?.componentKey).toBe("llm-node");
  expect(result[0]?.isBuiltin).toBe(true);
});

// ── listFlows ─────────────────────────────────────────────────────────────────

test("listFlows: GET /api/ai-center/flow/console/studio/，返回 FlowSummaryItem[]", async () => {
  const data = [flowSummaryMock];
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/flow/console/studio/": data });
  const svc = makeService(mockGateway);

  const result = await svc.listFlows();

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/flow/console/studio/");
  expect(call.method).toBe("GET");
  expect(Array.isArray(result)).toBe(true);
  expect(result[0]?.id).toBe("flow1");
  expect(result[0]?.name).toBe("Test Flow");
});

// ── listFlowsPage ─────────────────────────────────────────────────────────────

test("listFlowsPage: GET /flow/console/studio/?pageNumber=&pageSize=，分页字段完整", async () => {
  const pageResult = {
    total: 1,
    pages: 1,
    currentPage: 1,
    pageSize: 10,
    records: [flowSummaryMock],
  };
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/flow/console/studio/": pageResult });
  const svc = makeService(mockGateway);

  const result = await svc.listFlowsPage({ pageNumber: 1, pageSize: 10 });

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("pageNumber=1");
  expect(call.url).toContain("pageSize=10");
  expect(call.method).toBe("GET");
  expect(result.total).toBe(1);
  expect(result.records[0]?.id).toBe("flow1");
});

test("listFlowsPage: keyword 有值时附加到 URL，空串时不附加", async () => {
  const pageResult = { total: 0, pages: 0, currentPage: 1, pageSize: 10, records: [] };
  const { mockGateway: gw1, customMock: cm1 } = makeRoutedMockGateway({
    "/flow/console/studio/": pageResult,
  });
  const svc1 = makeService(gw1);
  await svc1.listFlowsPage({ pageNumber: 1, pageSize: 10, keyword: "hello" });
  const url1 = mockCallUrl(cm1);
  expect(url1).toContain("keyword=hello");

  const { mockGateway: gw2, customMock: cm2 } = makeRoutedMockGateway({
    "/flow/console/studio/": pageResult,
  });
  const svc2 = makeService(gw2);
  await svc2.listFlowsPage({ pageNumber: 1, pageSize: 10, keyword: "" });
  const url2 = mockCallUrl(cm2);
  expect(url2).not.toContain("keyword");
});

// ── createFlow ────────────────────────────────────────────────────────────────

test("createFlow: POST /flow/console/studio/，返回 FlowDetailItem（含 editorFlowJson）", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/flow/console/studio/": flowDetailMock });
  const svc = makeService(mockGateway);

  const result = await svc.createFlow({ name: "New Flow", editorFlowJson: editorFlowJsonMock });

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toMatch(/\/flow\/console\/studio\/$/);
  expect(call.method).toBe("POST");
  // editorFlowJson 保形：nodes[0].componentKey 契约
  expect(result.editorFlowJson.nodes[0]?.componentKey).toBe("llm-node");
});

// ── getFlow ───────────────────────────────────────────────────────────────────

test("getFlow: GET /flow/console/studio/:id，返回 FlowDetailItem", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/flow/console/studio/flow1": flowDetailMock,
  });
  const svc = makeService(mockGateway);

  const result = await svc.getFlow("flow1");

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/flow/console/studio/flow1");
  expect(call.method).toBe("GET");
  expect(result.id).toBe("flow1");
  expect(result.editorFlowJson.nodes).toHaveLength(1);
});

// ── exportFlow ────────────────────────────────────────────────────────────────

test("exportFlow: GET /flow/console/studio/:id/export，返回 FlowExportItem（含 editorFlowJson）", async () => {
  const exportMock = {
    schemaVersion: "1.0",
    exportedAt: 1_000_000,
    flow: {
      id: "flow1",
      name: "Test Flow",
      description: null,
      enabled: true,
      remark: null,
      compileStatus: "compiled",
      compileRevision: "rev1",
      publishedRevision: null,
    },
    editorFlowJson: editorFlowJsonMock,
    compiledFlowJson: null,
    componentSnapshotJson: null,
  };
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/export": exportMock });
  const svc = makeService(mockGateway);

  const result = await svc.exportFlow("flow1");

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/flow/console/studio/flow1/export");
  expect(call.method).toBe("GET");
  expect(result.schemaVersion).toBe("1.0");
  expect(result.editorFlowJson.nodes[0]?.componentKey).toBe("llm-node");
});

// ── saveFlow ──────────────────────────────────────────────────────────────────

test("saveFlow: PUT /flow/console/studio/:id，返回 FlowDetailItem", async () => {
  const updated = { ...flowDetailMock, name: "Updated Flow" };
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/flow/console/studio/flow1": updated });
  const svc = makeService(mockGateway);

  const result = await svc.saveFlow("flow1", {
    name: "Updated Flow",
    editorFlowJson: editorFlowJsonMock,
  });

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/flow/console/studio/flow1");
  expect(call.method).toBe("PUT");
  expect(result.name).toBe("Updated Flow");
  expect(result.editorFlowJson.nodes[0]?.componentKey).toBe("llm-node");
});

// ── importFlow ────────────────────────────────────────────────────────────────

test("importFlow: POST /flow/console/studio/:id/import，返回 FlowDetailItem", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/import": flowDetailMock });
  const svc = makeService(mockGateway);

  const result = await svc.importFlow("flow1", {
    name: "Imported",
    editorFlowJson: editorFlowJsonMock,
  });

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/flow/console/studio/flow1/import");
  expect(call.method).toBe("POST");
  expect(result.id).toBe("flow1");
});

// ── deleteFlow ────────────────────────────────────────────────────────────────

test("deleteFlow: DELETE /flow/console/studio/:id", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/flow/console/studio/flow1": null });
  const svc = makeService(mockGateway);

  await svc.deleteFlow("flow1");

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/flow/console/studio/flow1");
  expect(call.method).toBe("DELETE");
});

// ── validateFlow ──────────────────────────────────────────────────────────────

test("validateFlow: POST /flow/console/studio/:id/validate，返回 FlowValidateResult", async () => {
  const validateResult = { ok: true, issues: [] };
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/validate": validateResult });
  const svc = makeService(mockGateway);

  const result = await svc.validateFlow("flow1");

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/flow/console/studio/flow1/validate");
  expect(call.method).toBe("POST");
  expect(result.ok).toBe(true);
  expect(Array.isArray(result.issues)).toBe(true);
});

// ── debugFlow ─────────────────────────────────────────────────────────────────

test("debugFlow: POST /flow/console/studio/:id/debug，无 signal 时正常返回", async () => {
  const debugResult = {
    ok: true,
    mode: "compile-preview",
    issues: [],
    input: null,
    outputText: "hello",
    outputCount: 1,
    durationMs: 200,
  };
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/debug": debugResult });
  const svc = makeService(mockGateway);

  const result = await svc.debugFlow("flow1", { input: "test" });

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/flow/console/studio/flow1/debug");
  expect(call.method).toBe("POST");
  expect(result.ok).toBe(true);
  expect(result.outputText).toBe("hello");
});

test("debugFlow: signal 已中止时立即 reject（AbortError）", async () => {
  const debugResult = {
    ok: true,
    mode: "compile-preview",
    issues: [],
    input: null,
    outputText: null,
    outputCount: 0,
    durationMs: 0,
  };
  const { mockGateway } = makeRoutedMockGateway({ "/debug": debugResult });
  const svc = makeService(mockGateway);

  const controller = new AbortController();
  controller.abort();

  await expect(svc.debugFlow("flow1", {}, { signal: controller.signal })).rejects.toThrow();
});

// ── uploadFlowFile ────────────────────────────────────────────────────────────

test("uploadFlowFile: POST /flow/console/studio/:id/files，multipart field=file，返回 FlowFileUploadResult", async () => {
  const uploadResult = { id: "file1", name: "test.png", url: "/files/file1", flowId: "flow1" };
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/files": uploadResult });
  const svc = makeService(mockGateway);

  const file = new File(["content"], "test.png", { type: "image/png" });
  const result = await svc.uploadFlowFile("flow1", file);

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string; payload: unknown };
  expect(call.url).toContain("/flow/console/studio/flow1/files");
  expect(call.method).toBe("POST");
  // FormData 经 createGatewayFetch 透传给 gateway.custom，字段名 'file' 与后端契约一致
  expect(call.payload instanceof FormData).toBe(true);
  const form = call.payload as FormData;
  const fileEntry = form.get("file");
  expect(fileEntry).toBeInstanceOf(File);
  expect((fileEntry as File).name).toBe("test.png");
  expect(result.id).toBe("file1");
});

// ── runFlow ───────────────────────────────────────────────────────────────────

test("runFlow: POST /flow/console/studio/:id/run，返回 FlowRunResult", async () => {
  const runResult = { raw: { outputs: ["output1"], session_id: "sess1" } };
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/run": runResult });
  const svc = makeService(mockGateway);

  const result = await svc.runFlow("flow1", { input: "hello", sessionId: "sess1" });

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/flow/console/studio/flow1/run");
  expect(call.method).toBe("POST");
  expect(result.raw?.session_id).toBe("sess1");
});

// ── getFlowMonitorTraces ──────────────────────────────────────────────────────

test("getFlowMonitorTraces: GET /flow/console/studio/:id/monitor/traces，query params 透传", async () => {
  const tracesResult = { items: [], total: 0 };
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/monitor/traces": tracesResult });
  const svc = makeService(mockGateway);

  const result = await svc.getFlowMonitorTraces("flow1", { page: 1, size: 20 });

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/flow/console/studio/flow1/monitor/traces");
  expect(call.url).toContain("page=1");
  expect(call.url).toContain("size=20");
  expect(call.method).toBe("GET");
  expect((result as Record<string, unknown>).total).toBe(0);
});

test("getFlowMonitorTraces: params 默认为 {}，无 query string", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/monitor/traces": {} });
  const svc = makeService(mockGateway);

  await svc.getFlowMonitorTraces("flow1");

  const call = customMock.mock.calls[0]?.[0] as { url: string };
  expect(call.url).toContain("/flow/console/studio/flow1/monitor/traces");
  expect(call.url).not.toContain("page=");
});

// ── getFlowMonitorBuilds ──────────────────────────────────────────────────────

test("getFlowMonitorBuilds: GET /flow/console/studio/:id/monitor/builds，返回 FlowMonitorBuildsResult", async () => {
  const buildsResult = { items: [{ buildId: "b1" }], total: 1 };
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/monitor/builds": buildsResult });
  const svc = makeService(mockGateway);

  const result = await svc.getFlowMonitorBuilds("flow1", { page: 2, size: 5 });

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/flow/console/studio/flow1/monitor/builds");
  expect(call.url).toContain("page=2");
  expect(call.method).toBe("GET");
  expect((result as Record<string, unknown>).total).toBe(1);
});

// ── publishFlow ───────────────────────────────────────────────────────────────

test("publishFlow: POST /flow/console/studio/:id/publish，返回 FlowPublishResult", async () => {
  const publishResult = { releaseId: "rel1", releaseVersion: "v1.0.0" };
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/publish": publishResult });
  const svc = makeService(mockGateway);

  const result = await svc.publishFlow("flow1", { releaseNote: "First release" });

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/flow/console/studio/flow1/publish");
  expect(call.method).toBe("POST");
  expect(result.releaseId).toBe("rel1");
  expect(result.releaseVersion).toBe("v1.0.0");
});

// ── listFlowReferences ────────────────────────────────────────────────────────

test("listFlowReferences: GET /flow/console/studio/:id/references，返回 FlowResourceReferenceItem[]", async () => {
  const refItem = {
    id: "ref1",
    flowId: "flow1",
    nodeId: "n1",
    componentKey: "llm-node",
    resourceType: "model",
    resourceId: "model1",
    resourceSubId: null,
    resourceNameSnapshot: "GPT-4o",
    resourceStatusSnapshot: null,
    required: true,
    invalid: false,
    invalidReason: null,
  };
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/references": [refItem] });
  const svc = makeService(mockGateway);

  const result = await svc.listFlowReferences("flow1");

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/flow/console/studio/flow1/references");
  expect(call.method).toBe("GET");
  expect(result[0]?.componentKey).toBe("llm-node");
  expect(result[0]?.resourceType).toBe("model");
});

// ── listFlowsByResource ───────────────────────────────────────────────────────

test("listFlowsByResource: GET /flow/console/studio/references/by-resource?resourceType=&resourceId=", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/by-resource": [flowSummaryMock] });
  const svc = makeService(mockGateway);

  const result = await svc.listFlowsByResource("model", "model1");

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/flow/console/studio/references/by-resource");
  expect(call.url).toContain("resourceType=model");
  expect(call.url).toContain("resourceId=model1");
  expect(call.method).toBe("GET");
  expect(result[0]?.id).toBe("flow1");
});

// ── KB fixtures ────────────────────────────────────────────────────────────────

const chunkItemMock = {
  chunkId: "chunk-1",
  chunkIndex: 0,
  text: "Hello world",
  charCount: 11,
  recallCount: 3,
  embeddingText: "Hello world",
  headingPath: [] as string[],
  sectionId: "sec-1",
  pageNo: null as number | null,
  chunkType: "text",
  keywords: ["hello"],
};

const previewItemMock = {
  chunkId: "chunk-1",
  chunkIndex: 0,
  text: "Preview text",
  headingPath: [] as string[],
  sectionId: "sec-1",
  pageNo: null as number | null,
  chunkType: "text",
  orderInSection: 0,
  charCount: 12,
  recallCount: 0,
};

// ── segmentKnowledgeDocument ──────────────────────────────────────────────────

test("segmentKnowledgeDocument: POST /api/ai-center/kb/console/documents/:id/reindex，触发重建分段", async () => {
  const reindexResult = {
    documentId: "doc-1",
    importJobId: "job-1",
    status: "indexed",
    supportedForParsing: true,
  };
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/kb/console/documents/doc-1/reindex": reindexResult,
  });
  const svc = makeService(mockGateway);

  const result = await svc.segmentKnowledgeDocument("doc-1", { chunkSize: 512, chunkOverlap: 50 });

  const call = customMock.mock.calls[0]?.[0] as {
    url: string;
    method: string;
    payload?: Record<string, unknown>;
  };
  expect(call.url).toContain("/kb/console/documents/doc-1/reindex");
  expect(call.method).toBe("POST");
  // KnowledgeChunkingPayload 字段直透传 reindex body
  expect(call.payload?.chunkSize).toBe(512);
  expect(call.payload?.chunkOverlap).toBe(50);
  // KnowledgeDocumentSegmentResult: 核心字段来自 kb-core，chunks=[] (reindex 为异步任务)
  expect(result.documentId).toBe("doc-1");
  expect(result.importJobId).toBe("job-1");
  expect(result.status).toBe("indexed");
  expect(Array.isArray(result.chunks)).toBe(true);
});

// ── listKnowledgeDocumentSegments ─────────────────────────────────────────────

test("listKnowledgeDocumentSegments: GET /api/ai-center/kb/console/documents/:id/chunks，返回 KnowledgeDocumentSegmentListResult", async () => {
  const chunksResp = { items: [chunkItemMock] };
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/kb/console/documents/doc-1/chunks": chunksResp,
  });
  const svc = makeService(mockGateway);

  const result = await svc.listKnowledgeDocumentSegments("doc-1");

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/kb/console/documents/doc-1/chunks");
  expect(call.method).toBe("GET");
  // KnowledgeDocumentSegmentListResult: documentId 来自入参，chunks 来自 kb-core items (segment=chunk 1:1)
  expect(result.documentId).toBe("doc-1");
  expect(Array.isArray(result.chunks)).toBe(true);
  expect(result.chunks[0]?.chunkId).toBe("chunk-1");
  expect(result.chunks[0]?.text).toBe("Hello world");
});

// ── previewKnowledgeDocumentSegments ──────────────────────────────────────────

test("previewKnowledgeDocumentSegments: POST /api/ai-center/kb/console/documents/:id/preview，返回 KnowledgeDocumentSegmentPreviewResult", async () => {
  const previewResp = { chunkCount: 1, items: [previewItemMock] };
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/kb/console/documents/doc-1/preview": previewResp,
  });
  const svc = makeService(mockGateway);

  const result = await svc.previewKnowledgeDocumentSegments("doc-1", { chunkSize: 256 });

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/kb/console/documents/doc-1/preview");
  expect(call.method).toBe("POST");
  // KnowledgeDocumentSegmentPreviewResult: documentId 来自入参，chunkCount/items 来自 kb-core
  // 注：previewDocumentById 读取已入库分段快照，chunking payload 不透传（语义不匹配）
  expect(result.documentId).toBe("doc-1");
  expect(result.chunkCount).toBe(1);
  expect(Array.isArray(result.items)).toBe(true);
  expect(result.items[0]?.chunkId).toBe("chunk-1");
  expect(result.items[0]?.text).toBe("Preview text");
});

// ── updateKnowledgeDocumentSegment ────────────────────────────────────────────

test("updateKnowledgeDocumentSegment: PUT /api/ai-center/kb/console/documents/:docId/chunks/:chunkId，返回 KnowledgeDocumentSegmentItem", async () => {
  const updatedChunk = { ...chunkItemMock, text: "Updated text" };
  const { mockGateway, customMock } = makeRoutedMockGateway({ "/chunks/chunk-1": updatedChunk });
  const svc = makeService(mockGateway);

  const result = await svc.updateKnowledgeDocumentSegment("doc-1", "chunk-1", {
    text: "Updated text",
  });

  const call = customMock.mock.calls[0]?.[0] as {
    url: string;
    method: string;
    payload?: Record<string, unknown>;
  };
  expect(call.url).toContain("/kb/console/documents/doc-1/chunks/chunk-1");
  expect(call.method).toBe("PUT");
  // KnowledgeDocumentSegmentUpdatePayload 字段(text/keywordsAdd/keywordsRemove)与 kb-core 一致，直透传
  expect(call.payload?.text).toBe("Updated text");
  expect(result.chunkId).toBe("chunk-1");
  expect(result.text).toBe("Updated text");
});

// ── testKnowledgeDocumentRetrieval ────────────────────────────────────────────

test("searchKnowledge: POST /api/ai-center/kb/search，返回 KnowledgeSearchResult", async () => {
  const searchResp = {
    items: [{ text: "matched text", score: 0.9, documentId: "doc-9", headingPath: ["章"], keywords: ["安"] }],
  };
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/kb/search": searchResp,
  });
  const svc = makeService(mockGateway);

  const result = await svc.searchKnowledge({
    query: "安全生产",
    topK: 10,
  });

  const call = customMock.mock.calls[0]?.[0] as {
    url: string;
    method: string;
    payload?: { query: string; topK?: number };
  };
  expect(call.url).toContain("/kb/search");
  expect(call.method).toBe("POST");
  expect(call.payload?.query).toBe("安全生产");
  expect(call.payload?.topK).toBe(10);
  expect(result.items[0]?.documentId).toBe("doc-9");
  expect(result.items[0]?.text).toBe("matched text");
});

test("testKnowledgeDocumentRetrieval: POST /api/ai-center/kb/search/by-documents，返回 KnowledgeRetrievalTestResult", async () => {
  // kb-core 实际返回 { items: SearchItem[] }（chunk 级别），SDK 已对齐此格式。
  const searchResp = {
    items: [{ text: "matched text", score: 0.85, headingPath: ["Chapter 1"], keywords: ["test"] }],
  };
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/kb/search/by-documents": searchResp,
  });
  const svc = makeService(mockGateway);

  const result = await svc.testKnowledgeDocumentRetrieval("doc-1", {
    query: "test query",
    topK: 3,
  });

  const call = customMock.mock.calls[0]?.[0] as {
    url: string;
    method: string;
    payload?: { query: string; documents: { documentId: string; topK?: number }[] };
  };
  expect(call.url).toContain("/kb/search/by-documents");
  expect(call.method).toBe("POST");
  // payload: query + documents 数组，documentId=bizDocumentId，topK 透传
  expect(call.payload?.query).toBe("test query");
  expect(call.payload?.documents?.[0]?.documentId).toBe("doc-1");
  expect(call.payload?.documents?.[0]?.topK).toBe(3);
  // KnowledgeRetrievalTestResult: documentId 来自入参，items 来自 kb-core items 直接映射
  expect(result.documentId).toBe("doc-1");
  expect(Array.isArray(result.items)).toBe(true);
  expect(result.items[0]?.text).toBe("matched text");
  expect(result.items[0]?.score).toBe(0.85);
  expect(result.items[0]?.headingPath).toEqual(["Chapter 1"]);
});

// ── agent management ──────────────────────────────────────────────────────────

const agentViewMock = {
  id: "agt_abc123",
  kind: "agent",
  name: "安全助理",
  status: "draft",
  headVersionNo: 1,
  publishedVersionNo: null,
  content: {
    displayName: "安全生产问答",
    prompt: "You are a safety assistant.",
    modelConfig: { model: "gpt-4o" },
  },
  createTime: 1_700_000_000_000,
  updateTime: 1_700_000_100_000,
};

test("listAgents: GET /agent/console/agents unwraps { items }", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/agent/console/agents": { items: [agentViewMock] },
  });
  const svc = makeService(mockGateway);

  const items = await svc.listAgents();

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/agent/console/agents");
  expect(call.method).toBe("GET");
  expect(items).toHaveLength(1);
  expect(items[0]?.id).toBe("agt_abc123");
});

test("createAgent: POST /agent/console/agents with { name, content }", async () => {
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/agent/console/agents": agentViewMock,
  });
  const svc = makeService(mockGateway);

  const view = await svc.createAgent("安全助理", { displayName: "安全助理", prompt: "You are a safety assistant." });

  const call = customMock.mock.calls[0]?.[0] as {
    url: string;
    method: string;
    payload?: { name: string; content: { prompt: string; displayName?: string } };
  };
  expect(call.url).toContain("/agent/console/agents");
  expect(call.method).toBe("POST");
  expect(call.payload?.name).toBe("安全助理");
  expect(call.payload?.content?.prompt).toBe("You are a safety assistant.");
  expect(view.id).toBe("agt_abc123");
});

test("publishAgent: POST /agent/console/agents/:id/publish", async () => {
  const published = { ...agentViewMock, status: "published", publishedVersionNo: 1 };
  const { mockGateway, customMock } = makeRoutedMockGateway({
    "/agent/console/agents/agt_abc123/publish": published,
  });
  const svc = makeService(mockGateway);

  const view = await svc.publishAgent("agt_abc123");

  const call = customMock.mock.calls[0]?.[0] as { url: string; method: string };
  expect(call.url).toContain("/agent/console/agents/agt_abc123/publish");
  expect(call.method).toBe("POST");
  expect(view.status).toBe("published");
});
