import { createAgenticClient, type AgenticClient } from "@cube-ai/agent-sdk-client";

import { resolveAgenticEngineBase } from "./ai-center-api-base";
import { authStore } from "./auth-store";

function resolveAuthToken(): string {
  return authStore.token.trim();
}

/**
 * Agentic 消费面客户端（`/agent/sessions` 等）。
 * 与 assistant 一致：经 Vite proxy / 主壳网关打到 ai-center，支持 SSE 流式。
 */
export function createGatewayAgenticClient(): AgenticClient {
  return createAgenticClient({
    baseUrl: resolveAgenticEngineBase(),
    auth: {
      provider: () => resolveAuthToken(),
    },
    headersProvider: () => ({
      tenant: authStore.tenant,
      terminal: String(authStore.terminal),
    }),
  });
}
