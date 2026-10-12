import type { RuntimeRefs } from "@cube-ai/contracts";

import type { AgentKnowledgeRef } from "../agent-management/agent-knowledge-refs";
import type { AssistantComposerReference } from "./assistant-chat-ui";

/** 将 composer 引用与智能体绑定知识库合并为发送用 RuntimeRefs（按 kbId 去重）。 */
export function mergeComposerAndBoundKnowledgeRefs(
  composerRefs: readonly AssistantComposerReference[],
  boundKnowledge: readonly AgentKnowledgeRef[],
): RuntimeRefs | undefined {
  const knowledgeById = new Map<string, { kbId: string; displayName?: string }>();

  for (const ref of composerRefs) {
    if (ref.type !== "kb") {
      continue;
    }
    const kbId = ref.id.trim();
    if (!kbId) {
      continue;
    }
    knowledgeById.set(kbId, {
      kbId,
      ...(ref.label.trim() ? { displayName: ref.label.trim() } : {}),
    });
  }

  for (const ref of boundKnowledge) {
    const kbId = ref.kbId.trim();
    if (!kbId || knowledgeById.has(kbId)) {
      continue;
    }
    knowledgeById.set(kbId, {
      kbId,
      ...(ref.displayName.trim() ? { displayName: ref.displayName.trim() } : {}),
    });
  }

  const knowledgeBases = [...knowledgeById.values()];
  const userSkills = composerRefs.filter((ref) => ref.type === "skill").map((ref) => ({ skillId: ref.id, displayName: ref.label }));

  if (knowledgeBases.length === 0 && userSkills.length === 0) {
    return undefined;
  }

  return {
    ...(knowledgeBases.length > 0 ? { knowledgeBases } : {}),
    ...(userSkills.length > 0 ? { userSkills } : {}),
  };
}
