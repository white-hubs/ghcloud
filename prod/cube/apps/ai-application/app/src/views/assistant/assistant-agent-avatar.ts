import type { LibraryItemView, ShelfEntryView } from "@cube-ai/contracts";

import type { TenantAgentContentInput } from "@ghcloud/cube-ai-application-service";

import { agentConsoleClient } from "../../api/agent-console-client";
import { resolveAgentAvatarUrlFromContent, resolveAgentAvatarUrlFromTags } from "../agent-management/agent-avatar";
import type { AssistantAgentOption } from "./assistant-agent-options-builder";

/** getAgent 404 / 失败的 id，会话内不再重试 */
const missingAgentAvatarIds = new Set<string>();

/**
 * 选项列表尚未包含该智能体时，先缓存头像；列表就绪后用 applyPendingAssistantAgentAvatars 写回。
 * 避免首屏 session→getAgent 早于 loadAgentOptions 时 patch 落空。
 */
const pendingAssistantAgentAvatars = new Map<string, string>();

export function resolveAssistantAgentAvatarFromLibraryItem(item: LibraryItemView | undefined): string {
  if (!item?.content || typeof item.content !== "object") {
    return "";
  }
  return resolveAgentAvatarUrlFromContent(item.content as TenantAgentContentInput);
}

/** 按 id 写回头像；已有非空 avatarUrl 则保留。 */
export function patchAssistantAgentAvatar(
  options: readonly AssistantAgentOption[],
  agentId: string,
  avatarUrl: string,
): AssistantAgentOption[] {
  const url = avatarUrl.trim();
  if (!agentId || !url) {
    return [...options];
  }
  if (!options.some((item) => item.id === agentId)) {
    pendingAssistantAgentAvatars.set(agentId, url);
    return [...options];
  }
  pendingAssistantAgentAvatars.delete(agentId);
  let changed = false;
  const next = options.map((item) => {
    if (item.id !== agentId || item.avatarUrl?.trim()) {
      return item;
    }
    changed = true;
    return { ...item, avatarUrl: url };
  });
  return changed ? next : [...options];
}

/** 将「选项未就绪时」缓存的头像写回列表。 */
export function applyPendingAssistantAgentAvatars(options: readonly AssistantAgentOption[]): AssistantAgentOption[] {
  if (pendingAssistantAgentAvatars.size === 0 || options.length === 0) {
    return [...options];
  }
  let next: AssistantAgentOption[] = [...options];
  for (const [id, url] of pendingAssistantAgentAvatars) {
    if (!next.some((item) => item.id === id)) {
      continue;
    }
    next = patchAssistantAgentAvatar(next, id, url);
  }
  return next;
}

/**
 * 仅用 library lookup 补齐头像，不额外请求 getAgent。
 * 自建未上架智能体由 hydrateAuthoredAgentAvatars 补齐。
 */
export function enrichAssistantAgentAvatars(
  options: AssistantAgentOption[],
  libraryByRef?: Map<string, LibraryItemView>,
): AssistantAgentOption[] {
  if (options.length === 0) {
    return options;
  }
  return options.map((item) => {
    if (item.avatarUrl?.trim()) {
      return item;
    }
    const avatarUrl = resolveAssistantAgentAvatarFromLibraryItem(libraryByRef?.get(item.id));
    return avatarUrl ? { ...item, avatarUrl } : item;
  });
}

/** 对 authored 且仍无头像的选项拉 getAgent 补齐（与绑定知识库同策略，失败记入 missing）。 */
export async function hydrateAuthoredAgentAvatars(
  options: AssistantAgentOption[],
  agentShelf?: readonly ShelfEntryView[],
): Promise<AssistantAgentOption[]> {
  const authoredIds = new Set(
    (agentShelf ?? []).filter((entry) => entry.targetKind === "agent" && entry.source === "authored").map((entry) => entry.targetId),
  );

  const needFetch = options.filter((item) => {
    if (item.avatarUrl?.trim()) {
      return false;
    }
    if (item.source === "authored" || authoredIds.has(item.id)) {
      return !missingAgentAvatarIds.has(item.id);
    }
    return false;
  });

  if (needFetch.length === 0) {
    return options;
  }

  const avatarById = new Map<string, string>();
  await Promise.all(
    needFetch.map(async (item) => {
      try {
        const view = await agentConsoleClient.getAgent(item.id);
        const tags = Array.isArray(view.content?.tags) ? (view.content.tags as string[]) : [];
        const avatarUrl =
          resolveAgentAvatarUrlFromTags(tags) || resolveAgentAvatarUrlFromContent(view.content as TenantAgentContentInput | undefined);
        if (avatarUrl) {
          avatarById.set(item.id, avatarUrl);
        }
      } catch {
        missingAgentAvatarIds.add(item.id);
      }
    }),
  );

  if (avatarById.size === 0) {
    return options;
  }

  return options.map((item) => {
    const avatarUrl = avatarById.get(item.id);
    return avatarUrl ? { ...item, avatarUrl } : item;
  });
}

/**
 * 为当前选中智能体补齐头像（聊天记录气泡用）。
 * 已有 avatarUrl 则跳过；authored / agt_* 走 getAgent。
 */
export async function ensureAssistantAgentAvatar(
  agentId: string,
  options: readonly AssistantAgentOption[],
): Promise<{ options: AssistantAgentOption[]; avatarUrl: string }> {
  const id = agentId.trim();
  if (!id) {
    return { options: [...options], avatarUrl: "" };
  }
  const current = options.find((item) => item.id === id);
  const existing = current?.avatarUrl?.trim() ?? "";
  if (existing) {
    return { options: [...options], avatarUrl: existing };
  }
  if (missingAgentAvatarIds.has(id)) {
    return { options: [...options], avatarUrl: "" };
  }
  const shouldFetch = current?.source === "authored" || id.startsWith("agt_");
  if (!shouldFetch) {
    return { options: [...options], avatarUrl: "" };
  }
  try {
    const view = await agentConsoleClient.getAgent(id);
    const tags = Array.isArray(view.content?.tags) ? (view.content.tags as string[]) : [];
    const avatarUrl =
      resolveAgentAvatarUrlFromTags(tags) || resolveAgentAvatarUrlFromContent(view.content as TenantAgentContentInput | undefined);
    if (!avatarUrl) {
      return { options: [...options], avatarUrl: "" };
    }
    return { options: patchAssistantAgentAvatar(options, id, avatarUrl), avatarUrl };
  } catch {
    missingAgentAvatarIds.add(id);
    return { options: [...options], avatarUrl: "" };
  }
}
