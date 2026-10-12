import { AgentConsoleClient } from "@cube-ai/agent-sdk-console";
import { FlowClient } from "@cube-ai/flow-sdk-client";
import { FlowConsoleClient } from "@cube-ai/flow-sdk-console";
import { KbClient } from "@cube-ai/kb-sdk-client";
import { KbConsoleClient } from "@cube-ai/kb-sdk-console";
import { LlmConsoleClient } from "@cube-ai/llm-sdk-console";

import { CubeGateway } from "@ghcloud/cube-gateway";
import type { CubeAuth } from "@ghcloud/cube-gateway";
import { CubeHeaders } from "@ghcloud/cube-protocol";

/**
 * AI-Center 网关前缀。网关须把该前缀路由到 ai-center；SDK 的管理面
 * pathPrefix (/flow/console|/llm/console|/kb/console) 会拼在其后，例如：
 *   /api/ai-center/llm/console/providers
 *   /api/ai-center/flow/console/studio/...
 */
export const AI_CENTER_GATEWAY_BASE =
  ((import.meta as any)?.env?.VITE_AI_CENTER_API_BASE as string | undefined)?.trim() || "/api/ai-center";

export interface CubeAiTransportOptions {
  baseUrl?: string;
}

type AuthUpdatableGateway = CubeGateway & {
  updateAuth?: (auth: Partial<CubeAuth>) => void;
};

type SdkTransportGateway = Omit<CubeGateway, "custom"> & {
  custom: <T>(options: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    url: string;
    payload?: Record<string, unknown> | FormData;
  }) => Promise<T>;
};

function syncGatewayAuth(gateway: CubeGateway, auth?: Partial<CubeAuth>): void {
  if (auth == null) {
    return;
  }
  (gateway as AuthUpdatableGateway).updateAuth?.(auth);
}

function flattenRequestHeaders(headers?: HeadersInit): Record<string, string> {
  if (headers == null) {
    return {};
  }
  if (headers instanceof Headers) {
    const out: Record<string, string> = {};
    headers.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return { ...headers };
}

function requestAcceptsEventStream(init?: RequestInit): boolean {
  const accept = flattenRequestHeaders(init?.headers).accept ?? flattenRequestHeaders(init?.headers).Accept;
  return String(accept ?? "").includes("text/event-stream");
}

function requestContentType(init?: RequestInit): string {
  const headers = flattenRequestHeaders(init?.headers);
  return String(headers["content-type"] ?? headers["Content-Type"] ?? "").toLowerCase();
}

function buildGatewayAuthHeaders(auth?: Partial<CubeAuth>): Record<string, string> {
  const headers: Record<string, string> = {};
  if (auth?.tenant != null && String(auth.tenant) !== "") {
    headers[CubeHeaders.TENANT] = String(auth.tenant);
  }
  if (auth?.token) {
    headers[CubeHeaders.AUTHORIZATION] = `Bearer ${auth.token}`;
  }
  if (auth?.terminal != null && String(auth.terminal) !== "") {
    headers[CubeHeaders.TERMINAL] = String(auth.terminal);
  }
  return headers;
}

export function createGatewayFetch(gateway: CubeGateway, auth?: Partial<CubeAuth>): typeof fetch {
  const fetchFn = async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]): Promise<Response> => {
    syncGatewayAuth(gateway, auth);

    if (requestAcceptsEventStream(init)) {
      // gateway.custom 会缓冲并 JSON 解析响应，无法消费 propose 等 SSE 流。
      return fetch(String(input), {
        ...init,
        headers: {
          ...flattenRequestHeaders(init?.headers),
          ...buildGatewayAuthHeaders(auth),
        },
      });
    }

    const method = (init?.method?.toUpperCase() ?? "GET") as "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    const url = String(input);

    const rawBody = init?.body;
    let payload: Record<string, unknown> | FormData | string | undefined;
    if (rawBody instanceof FormData) {
      payload = rawBody;
    } else if (typeof rawBody === "string" && rawBody.length > 0) {
      payload = requestContentType(init).includes("text/plain") ? rawBody : (JSON.parse(rawBody) as Record<string, unknown>);
    }

    // ServiceError from gateway propagates without catching — preserves upstream errorNotify UX
    const data = await (gateway as SdkTransportGateway).custom<unknown>({
      method,
      url,
      ...(payload !== undefined ? { payload } : {}),
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  // Cast: bun adds static `preconnect` to `typeof fetch`; our wrapper only needs the call signature
  return fetchFn as typeof fetch;
}

export interface CubeAiClients {
  agentConsole: AgentConsoleClient;
  flow: FlowClient;
  flowConsole: FlowConsoleClient;
  llm: LlmConsoleClient;
  kb: KbClient;
  kbConsole: KbConsoleClient;
}

function resolveGatewayBase(options?: CubeAiTransportOptions): string {
  return (options?.baseUrl?.trim() || AI_CENTER_GATEWAY_BASE).replace(/\/+$/, "");
}

function buildClients(gateway: CubeGateway, auth: Partial<CubeAuth> | undefined, options?: CubeAiTransportOptions): CubeAiClients {
  const baseUrl = resolveGatewayBase(options);
  const fetchImpl = createGatewayFetch(gateway, auth);
  return {
    agentConsole: new AgentConsoleClient({ baseUrl, fetchImpl }),
    flow: new FlowClient({ baseUrl, fetchImpl }),
    flowConsole: new FlowConsoleClient({ baseUrl, fetchImpl }),
    llm: new LlmConsoleClient({ baseUrl, fetchImpl }),
    kb: new KbClient({ baseUrl, fetchImpl }),
    kbConsole: new KbConsoleClient({ baseUrl, fetchImpl }),
  };
}

/**
 * WS1/WS2/WS3 用法：
 *   const clients = createCubeAiClients(auth)
 *   await clients.llm.listProviders()
 *   await clients.agentConsole.listAgents()
 *   await clients.flow.saveFlow(flowId, body)
 */
export function createCubeAiClients(auth: CubeAuth, options?: CubeAiTransportOptions): CubeAiClients {
  const gateway = new CubeGateway(auth);
  return buildClients(gateway, auth, options);
}

/**
 * 测试用：注入预构造的 gateway（可为 mock），绕过 new CubeGateway(auth)。
 */
export function createCubeAiClientsFromGateway(gateway: CubeGateway, options?: CubeAiTransportOptions): CubeAiClients {
  return buildClients(gateway, undefined, options);
}
