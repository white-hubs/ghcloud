import type { RuntimeRefs } from "@cube-ai/contracts";

import { filterBindableSkillRefs } from "../agent-management/agent-skill-binding";
import type { AssistantComposerReference } from "./assistant-chat-ui";

export interface BoundSkillRef {
  skillId: string;
  displayName: string;
}

/** 从智能体 content.skillRefs 得到可展示/可取消的绑定技能（已剔平台默认）。 */
export function resolveBoundSkillRefsFromContent(
  content: { skillRefs?: string[] | null } | null | undefined,
  labelById?: ReadonlyMap<string, string>,
): BoundSkillRef[] {
  return filterBindableSkillRefs(content?.skillRefs ?? []).map((skillId) => ({
    skillId,
    displayName: labelById?.get(skillId)?.trim() || skillId,
  }));
}

/**
 * 合并发送用 RuntimeRefs：
 * - 绑定技能：已勾选的留在会话快照生效；取消勾选的写入 disabledSkillIds
 * - 非绑定技能：勾选的进 userSkills（临时 @ 钉选）
 * - 知识库：仍合并 composer + 智能体绑定 KB
 */
/** 兼容尚未升级的 contracts 类型：disabledSkillIds 为新增字段。 */
export type AssistantRuntimeRefs = RuntimeRefs & {
  disabledSkillIds?: string[];
};

export function mergeComposerBoundKnowledgeAndSkillRuntimeRefs(
  composerRefs: readonly AssistantComposerReference[],
  boundKnowledge: readonly { kbId: string; displayName: string }[],
  boundSkills: readonly BoundSkillRef[],
): AssistantRuntimeRefs | undefined {
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

  const boundSkillIds = new Set(boundSkills.map((item) => item.skillId));
  const selectedSkillIds = new Set(
    composerRefs
      .filter((ref) => ref.type === "skill")
      .map((ref) => ref.id.trim())
      .filter(Boolean),
  );

  const disabledSkillIds = boundSkills.map((item) => item.skillId).filter((id) => !selectedSkillIds.has(id));

  const userSkills = composerRefs
    .filter((ref) => ref.type === "skill" && !boundSkillIds.has(ref.id.trim()))
    .map((ref) => ({
      skillId: ref.id,
      displayName: ref.label,
    }));

  const knowledgeBases = [...knowledgeById.values()];
  if (knowledgeBases.length === 0 && userSkills.length === 0 && disabledSkillIds.length === 0) {
    return undefined;
  }

  return {
    ...(knowledgeBases.length > 0 ? { knowledgeBases } : {}),
    ...(userSkills.length > 0 ? { userSkills } : {}),
    ...(disabledSkillIds.length > 0 ? { disabledSkillIds } : {}),
  };
}

/** 将绑定技能默认勾进 selectedReferences（已存在则保留用户当前勾选状态；名称就绪后升级 label）。 */
export function ensureBoundSkillsSelected(
  selected: readonly AssistantComposerReference[],
  boundSkills: readonly BoundSkillRef[],
): AssistantComposerReference[] {
  const boundById = new Map(boundSkills.map((item) => [item.skillId, item] as const));
  const next = selected.map((ref) => {
    if (ref.type !== "skill") {
      return ref;
    }
    const bound = boundById.get(ref.id);
    if (!bound) {
      return ref;
    }
    const label = bound.displayName.trim();
    if (!label || label === ref.label) {
      return ref;
    }
    // 首屏 getAgent 早于技能货架时 label 常为 skl_*；名称就绪后写回
    if (ref.description === "智能体绑定" || ref.label === ref.id) {
      return { ...ref, label, description: "智能体绑定" };
    }
    return ref;
  });
  if (boundSkills.length === 0) {
    return next;
  }
  const selectedKeys = new Set(next.filter((ref) => ref.type === "skill").map((ref) => ref.id));
  for (const skill of boundSkills) {
    if (selectedKeys.has(skill.skillId)) {
      continue;
    }
    next.push({
      type: "skill",
      id: skill.skillId,
      label: skill.displayName,
      description: "智能体绑定",
    });
    selectedKeys.add(skill.skillId);
  }
  return next;
}

/**
 * composer 输入框上方的引用 token：技能已由顶部 skill chips 展示与取消，此处只保留知识库等，
 * 避免首屏绑定技能以「技能 skl_…」重复露出。
 */
export function filterComposerReferenceTokens<T extends { type: string }>(refs: readonly T[]): T[] {
  return refs.filter((ref) => ref.type !== "skill");
}

/**
 * 切换会话/智能体后同步 composer 勾选：
 * - 去掉已不属于当前智能体的「智能体绑定」技能
 * - 补回当前绑定技能的默认勾选
 *
 * 会话草稿恢复会清空 selectedReferences；若新会话仍是同一智能体，
 * boundSkillRefs 的 id 列表不变，单靠 boundSkillRefs watch 不会重跑，故草稿恢复后必须再调一次。
 */
export function syncComposerBoundSkillSelections(
  selected: readonly AssistantComposerReference[],
  boundSkills: readonly BoundSkillRef[],
): AssistantComposerReference[] {
  const boundIds = new Set(boundSkills.map((item) => item.skillId));
  const kept = selected.filter((ref) => {
    if (ref.type !== "skill" || ref.description !== "智能体绑定") {
      return true;
    }
    return boundIds.has(ref.id);
  });
  return ensureBoundSkillsSelected(kept, boundSkills);
}
