import type { AgentConsoleClient } from "@cube-ai/agent-sdk-console";

import { createCubeAiClients } from "@ghcloud/cube-ai-application-service";

import { resolveAiCenterApiBase } from "./ai-center-api-base";
import { authStore } from "./auth-store";

function buildAuth() {
  return {
    token: authStore.token.trim(),
    tenant: String(authStore.tenant),
    terminal: authStore.terminal,
  };
}

function createClient(): AgentConsoleClient {
  return createCubeAiClients(buildAuth(), { baseUrl: resolveAiCenterApiBase() }).agentConsole;
}

/** 每次调用时用当前 authStore 新建 SDK 客户端，避免 H5 登录态刷新后继续使用旧 token。 */
export const agentConsoleClient = new Proxy({} as AgentConsoleClient, {
  get(_target, prop) {
    const client = createClient();
    const value = Reflect.get(client as object, prop, client);
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
