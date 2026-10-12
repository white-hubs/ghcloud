/** 智能体头像：经 content.tags 持久化（与 description / knowledge 同模式）。 */

export const AGENT_AVATAR_URL_TAG_PREFIX = "ghcloud.agent.avatarUrl:";
export const AGENT_AVATAR_FILE_ID_TAG_PREFIX = "ghcloud.agent.avatarFileId:";

export interface AgentAvatarState {
  avatarUrl: string;
  avatarFileId: string;
}

function isAgentAvatarUrlTag(tag: string): boolean {
  return tag.startsWith(AGENT_AVATAR_URL_TAG_PREFIX);
}

function isAgentAvatarFileIdTag(tag: string): boolean {
  return tag.startsWith(AGENT_AVATAR_FILE_ID_TAG_PREFIX);
}

export function isAgentAvatarTag(tag: string): boolean {
  return isAgentAvatarUrlTag(tag) || isAgentAvatarFileIdTag(tag);
}

function decodeTaggedValue(tag: string, prefix: string): string {
  const encoded = tag.slice(prefix.length);
  try {
    return decodeURIComponent(encoded).trim();
  } catch {
    return encoded.trim();
  }
}

export function parseAgentAvatarFromTags(tags: string[] | undefined): AgentAvatarState {
  let avatarUrl = "";
  let avatarFileId = "";
  if (!tags?.length) {
    return { avatarUrl, avatarFileId };
  }
  for (const tag of tags) {
    if (isAgentAvatarUrlTag(tag) && !avatarUrl) {
      avatarUrl = decodeTaggedValue(tag, AGENT_AVATAR_URL_TAG_PREFIX);
      continue;
    }
    if (isAgentAvatarFileIdTag(tag) && !avatarFileId) {
      avatarFileId = decodeTaggedValue(tag, AGENT_AVATAR_FILE_ID_TAG_PREFIX);
    }
  }
  return { avatarUrl, avatarFileId };
}

/** 保留非头像 tags，再按需追加 avatarUrl / avatarFileId。 */
export function buildTagsWithAgentAvatar(existingTags: string[] | undefined, avatar: AgentAvatarState): string[] {
  const preserved = (existingTags ?? []).filter((tag) => !isAgentAvatarTag(tag));
  const next = [...preserved];
  const avatarUrl = avatar.avatarUrl.trim();
  const avatarFileId = avatar.avatarFileId.trim();
  if (avatarUrl) {
    next.push(`${AGENT_AVATAR_URL_TAG_PREFIX}${encodeURIComponent(avatarUrl)}`);
  }
  if (avatarFileId) {
    next.push(`${AGENT_AVATAR_FILE_ID_TAG_PREFIX}${encodeURIComponent(avatarFileId)}`);
  }
  return next;
}

export function resolveAgentAvatarUrlFromTags(tags: string[] | undefined): string {
  return parseAgentAvatarFromTags(tags).avatarUrl;
}

export function resolveAgentAvatarUrlFromContent(content: { tags?: string[] } | null | undefined): string {
  return resolveAgentAvatarUrlFromTags(content?.tags);
}
