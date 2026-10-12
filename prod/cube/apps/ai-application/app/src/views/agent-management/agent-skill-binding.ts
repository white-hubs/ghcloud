import type { TenantAgentContentInput } from "@ghcloud/cube-ai-application-service";

import { agentConsoleClient, publishTenantAgent, updateTenantAgent } from "../../api/agent-console-client";
import { isEngineInternalLibraryRef } from "../../utils/engine-internal-catalog";

/** 编辑页 / 聊天可选技能：排除平台内部默认技能。 */
export function filterBindableSkillRefs(skillRefs: readonly string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of skillRefs) {
    const id = raw.trim();
    if (!id || seen.has(id) || isEngineInternalLibraryRef("skill", id)) {
      continue;
    }
    seen.add(id);
    out.push(id);
  }
  return out;
}

/**
 * 从「我的技能」移除后：扫本人创作的智能体，剔除 content.skillRefs 中的该技能。
 * 一次 listAgents，仅对命中项 updateAgent；已发布的再 publish，使 runnable 头版本同步。
 */
export async function purgeSkillRefFromAuthoredAgents(skillId: string): Promise<number> {
  const targetId = skillId.trim();
  if (!targetId || isEngineInternalLibraryRef("skill", targetId)) {
    return 0;
  }

  const agents = await agentConsoleClient.listAgents();
  let updated = 0;

  for (const agent of agents) {
    const content = (agent.content ?? { prompt: "" }) as TenantAgentContentInput;
    const currentRefs = Array.isArray(content.skillRefs) ? content.skillRefs : [];
    if (!currentRefs.some((ref) => ref.trim() === targetId)) {
      continue;
    }
    const nextRefs = filterBindableSkillRefs(currentRefs.filter((ref) => ref.trim() !== targetId));
    const nextContent: TenantAgentContentInput = {
      ...content,
      skillRefs: nextRefs,
    };
    await updateTenantAgent(agent.id, nextContent);
    if (agent.status === "published") {
      await publishTenantAgent(agent.id).catch(() => {
        /* 发布失败不回滚已写入的 head；作者侧 resolve 已读 head */
      });
    }
    updated += 1;
  }

  return updated;
}
