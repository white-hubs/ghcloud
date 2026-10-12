/** 智能体绑定知识库：经 content.tags 持久化（与 description tag 同模式）。 */

export const AGENT_KNOWLEDGE_TAG_PREFIX = "ghcloud.agent.knowledge:";

export interface AgentKnowledgeRef {
  kbId: string;
  displayName: string;
}

function isAgentKnowledgeTag(tag: string): boolean {
  return tag.startsWith(AGENT_KNOWLEDGE_TAG_PREFIX);
}

function encodeKnowledgeTag(ref: AgentKnowledgeRef): string {
  const kbId = ref.kbId.trim();
  const name = ref.displayName.trim();
  const payload = name && name !== kbId ? `${kbId}|${name}` : kbId;
  return `${AGENT_KNOWLEDGE_TAG_PREFIX}${encodeURIComponent(payload)}`;
}

function decodeKnowledgeTag(tag: string): AgentKnowledgeRef | null {
  if (!isAgentKnowledgeTag(tag)) {
    return null;
  }
  const encoded = tag.slice(AGENT_KNOWLEDGE_TAG_PREFIX.length);
  let payload = encoded;
  try {
    payload = decodeURIComponent(encoded);
  } catch {
    /* keep raw */
  }
  const trimmed = payload.trim();
  if (!trimmed) {
    return null;
  }
  const sep = trimmed.indexOf("|");
  if (sep <= 0) {
    return { kbId: trimmed, displayName: trimmed };
  }
  const kbId = trimmed.slice(0, sep).trim();
  const displayName = trimmed.slice(sep + 1).trim() || kbId;
  if (!kbId) {
    return null;
  }
  return { kbId, displayName };
}

export function parseKnowledgeRefsFromTags(tags: string[] | undefined): AgentKnowledgeRef[] {
  if (!tags?.length) {
    return [];
  }
  const out: AgentKnowledgeRef[] = [];
  const seen = new Set<string>();
  for (const tag of tags) {
    const ref = decodeKnowledgeTag(tag);
    if (!ref || seen.has(ref.kbId)) {
      continue;
    }
    seen.add(ref.kbId);
    out.push(ref);
  }
  return out;
}

/** 保留非 knowledge tags，再追加绑定知识库 tags。 */
export function buildTagsWithKnowledgeRefs(existingTags: string[] | undefined, refs: readonly AgentKnowledgeRef[]): string[] {
  const preserved = (existingTags ?? []).filter((tag) => !isAgentKnowledgeTag(tag));
  const seen = new Set<string>();
  const knowledgeTags: string[] = [];
  for (const ref of refs) {
    const kbId = ref.kbId.trim();
    if (!kbId || seen.has(kbId)) {
      continue;
    }
    seen.add(kbId);
    knowledgeTags.push(encodeKnowledgeTag({ kbId, displayName: ref.displayName.trim() || kbId }));
  }
  return [...preserved, ...knowledgeTags];
}

export function isAgentKnowledgeTagForTest(tag: string): boolean {
  return isAgentKnowledgeTag(tag);
}
