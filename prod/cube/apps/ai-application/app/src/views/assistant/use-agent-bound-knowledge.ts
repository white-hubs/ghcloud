import { ref, watch, type Ref } from "vue";

import type { TenantAgentContentInput } from "@ghcloud/cube-ai-application-service";

import { agentConsoleClient } from "../../api/agent-console-client";
import { resolveAgentAvatarUrlFromTags } from "../agent-management/agent-avatar";
import { parseKnowledgeRefsFromTags, type AgentKnowledgeRef } from "../agent-management/agent-knowledge-refs";
import { patchAssistantAgentAvatar } from "./assistant-agent-avatar";
import type { AssistantAgentOption } from "./assistant-agent-options-builder";
import { resolveBoundSkillRefsFromContent, type BoundSkillRef } from "./assistant-bound-skills";

/** getAgent 404 / 失败的 id，会话内不再重试，避免 Network 红条刷屏 */
const missingAgentDetailIds = new Set<string>();

type SkillLabelSource = { readonly value: ReadonlyMap<string, string> };

/**
 * 按当前选中智能体解析绑定知识库 / 绑定技能（同一次 getAgent）。
 * 仅对货架 source=authored 的租户自建 agent 请求；库安装 / 系统智能体不请求。
 */
export function useAgentBoundKnowledge(
  selectedAgentId: Ref<string>,
  agentOptions?: Ref<AssistantAgentOption[]>,
  skillLabelById?: SkillLabelSource,
): {
  boundKnowledgeRefs: Ref<AgentKnowledgeRef[]>;
  boundSkillRefs: Ref<BoundSkillRef[]>;
  refreshBoundKnowledge: () => Promise<void>;
} {
  const boundKnowledgeRefs = ref<AgentKnowledgeRef[]>([]);
  const boundSkillRefs = ref<BoundSkillRef[]>([]);

  const refreshBoundKnowledge = async (): Promise<void> => {
    const agentId = selectedAgentId.value.trim();
    if (!agentId) {
      boundKnowledgeRefs.value = [];
      boundSkillRefs.value = [];
      return;
    }
    if (missingAgentDetailIds.has(agentId)) {
      boundKnowledgeRefs.value = [];
      boundSkillRefs.value = [];
      return;
    }
    const option = agentOptions?.value.find((item) => item.id === agentId);
    const shouldFetch = option != null ? option.source === "authored" : agentId.startsWith("agt_");
    if (!shouldFetch) {
      boundKnowledgeRefs.value = [];
      boundSkillRefs.value = [];
      return;
    }
    try {
      const view = await agentConsoleClient.getAgent(agentId);
      const content = (view.content ?? {}) as TenantAgentContentInput;
      const tags = Array.isArray(content.tags) ? content.tags : [];
      boundKnowledgeRefs.value = parseKnowledgeRefsFromTags(tags);
      boundSkillRefs.value = resolveBoundSkillRefsFromContent(content, skillLabelById?.value);
      const avatarUrl = resolveAgentAvatarUrlFromTags(tags);
      if (avatarUrl && agentOptions) {
        agentOptions.value = patchAssistantAgentAvatar(agentOptions.value, agentId, avatarUrl);
      }
    } catch {
      missingAgentDetailIds.add(agentId);
      boundKnowledgeRefs.value = [];
      boundSkillRefs.value = [];
    }
  };

  watch(
    selectedAgentId,
    () => {
      void refreshBoundKnowledge();
    },
    { immediate: true },
  );

  // 选项从空→有时 avatarUrl 仍可能一直是 undefined，单靠 avatarUrl watch 不会重跑；
  // 把 options.length 纳入 key，列表就绪后补拉绑定信息/头像。
  watch(
    () => {
      const id = selectedAgentId.value.trim();
      const option = agentOptions?.value.find((item) => item.id === id);
      if (!id) {
        return "";
      }
      if (option?.avatarUrl?.trim()) {
        return `ok:${id}`;
      }
      return `need:${id}:${agentOptions?.value.length ?? 0}`;
    },
    (key) => {
      if (!key.startsWith("need:")) {
        return;
      }
      void refreshBoundKnowledge();
    },
  );

  watch(
    () => skillLabelById?.value,
    () => {
      if (boundSkillRefs.value.length === 0) {
        return;
      }
      boundSkillRefs.value = boundSkillRefs.value.map((item) => ({
        ...item,
        displayName: skillLabelById?.value.get(item.skillId)?.trim() || item.displayName,
      }));
    },
  );

  return { boundKnowledgeRefs, boundSkillRefs, refreshBoundKnowledge };
}
