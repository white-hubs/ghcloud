import type { AgentConsoleClient, AgentContentInput, SkillContentInput } from "@cube-ai/agent-sdk-console";

import type { TenantAgentContentInput } from "@ghcloud/cube-ai-application-service";
import { createCubeAiClients } from "@ghcloud/cube-ai-application-service";

import { resolveAiCenterApiBase } from "./ai-center-api-base";
import { authStore } from "./auth-store";

function buildAuth() {
  return {
    token: authStore.token,
    tenant: authStore.tenant,
    terminal: authStore.terminal,
  };
}

function createClient(): AgentConsoleClient {
  return createCubeAiClients(buildAuth(), { baseUrl: resolveAiCenterApiBase() }).agentConsole;
}

/** 每次调用时用当前 authStore 新建 SDK 客户端，避免 qiankun 宿主晚于模块加载注入 token。 */
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

/** 服务端 POST /agents 要求 `{ name, content }`（name 为 descriptor 唯一标识，非 displayName）。 */
export async function createTenantAgent(name: string, content: TenantAgentContentInput) {
  return agentConsoleClient.createAgent({ name, content: content as AgentContentInput });
}

/** name 创建后不可变（服务端 update 只吃 content，不接受改名）；UI 侧不应提供改名入口。 */
export async function updateTenantAgent(agentId: string, content: TenantAgentContentInput) {
  return agentConsoleClient.updateAgent(agentId, content as AgentContentInput);
}

/**
 * 发布智能体。若网关/outbox 在 DB 提交后返回 500，回查 agent 状态并在已发布时视为成功。
 */
export async function publishTenantAgent(agentId: string) {
  try {
    return await agentConsoleClient.publishAgent(agentId);
  } catch (error) {
    const view = await agentConsoleClient.getAgent(agentId);
    if (view.status === "published") {
      return view;
    }
    throw error;
  }
}

/** 上架到智能体库。若 outbox 在 DB 提交后返回 500，回查 listing 并在已上架时视为成功。 */
export async function listTenantAgent(agentId: string, versionNo: number) {
  try {
    return await agentConsoleClient.listAgent(agentId, versionNo);
  } catch (error) {
    const listing = await agentConsoleClient.getAgentListing(agentId);
    if (listing?.listed === true) {
      return listing;
    }
    throw error;
  }
}

export async function unlistTenantAgent(agentId: string) {
  try {
    return await agentConsoleClient.unlistAgent(agentId);
  } catch (error) {
    const listing = await agentConsoleClient.getAgentListing(agentId);
    if (listing?.listed === false) {
      return listing;
    }
    throw error;
  }
}

/** 已上架智能体在发布新版本后，将库中 shared_version 同步到最新发布版。 */
export async function syncListedAgentToLibrary(
  agentId: string,
  published: { publishedVersionNo?: number | null; headVersionNo?: number },
): Promise<boolean> {
  const listing = await agentConsoleClient.getAgentListing(agentId).catch(() => null);
  if (!listing?.listed) {
    return false;
  }
  const versionNo = published.publishedVersionNo ?? published.headVersionNo;
  if (versionNo == null || versionNo <= 0) {
    return false;
  }
  await listTenantAgent(agentId, versionNo);
  return true;
}

/** 服务端 POST /skills 要求 `{ name, content }`（name 为 descriptor 唯一标识，非 displayName）。 */
export async function createTenantSkill(name: string, content: SkillContentInput) {
  return agentConsoleClient.createSkill({ name, content });
}

/** name 创建后不可变（服务端 update 只吃 content，不接受改名）；UI 侧不应提供改名入口。 */
export async function updateTenantSkill(skillId: string, content: SkillContentInput) {
  return agentConsoleClient.updateSkill(skillId, content);
}

/** 发布技能；若 outbox 在 DB 提交后返回 500，回查状态并在已发布时视为成功。 */
export async function publishTenantSkill(skillId: string) {
  try {
    return await agentConsoleClient.publishSkill(skillId);
  } catch (error) {
    const view = await agentConsoleClient.getSkill(skillId);
    if (view.status === "published") {
      return view;
    }
    throw error;
  }
}

/** 上架到技能库；若 outbox 在 DB 提交后返回 500，回查 listing 并在已上架时视为成功。 */
export async function listTenantSkill(skillId: string, versionNo: number) {
  try {
    return await agentConsoleClient.listSkill(skillId, versionNo);
  } catch (error) {
    const listing = await agentConsoleClient.getSkillListing(skillId);
    if (listing?.listed === true) {
      return listing;
    }
    throw error;
  }
}

/** 从技能库下架；已安装用户不受影响。 */
export async function unlistTenantSkill(skillId: string) {
  try {
    return await agentConsoleClient.unlistSkill(skillId);
  } catch (error) {
    const listing = await agentConsoleClient.getSkillListing(skillId);
    if (listing?.listed === false) {
      return listing;
    }
    throw error;
  }
}
