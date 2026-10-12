import type { LibraryItemView, ShelfEntryView } from "@cube-ai/contracts";

import type { TenantAgentContentInput } from "@ghcloud/cube-ai-application-service";

import { SYSTEM_ASSISTANT_AGENTS, type AssistantAgentOption } from "./assistant-agent-options-builder";

/** 与 agent-data 一致：简介经 tags 持久化（避免 import agent-data 拉入 Vue 图标）。 */
const AGENT_DESCRIPTION_TAG_PREFIX = "ghcloud.agent.description:";

function decodeAgentDescriptionFromTags(tags: string[] | undefined): string {
  if (!tags?.length) {
    return "";
  }
  for (const tag of tags) {
    if (!tag.startsWith(AGENT_DESCRIPTION_TAG_PREFIX)) {
      continue;
    }
    const encoded = tag.slice(AGENT_DESCRIPTION_TAG_PREFIX.length);
    try {
      return decodeURIComponent(encoded);
    } catch {
      return encoded;
    }
  }
  return "";
}

function resolveAgentDescription(content: TenantAgentContentInput): string {
  const fromTags = decodeAgentDescriptionFromTags(content.tags);
  if (fromTags) {
    return fromTags;
  }
  return content.description?.trim() ?? "";
}

/** 聊天空态用：只取真实简介，占位文案（暂无简介/系统预置）视为无。 */
export function resolveAssistantAgentDescriptionFromLibraryItem(item: LibraryItemView): string {
  const wire = item.description?.trim();
  if (wire && wire !== "暂无简介" && wire !== "系统预置智能体") {
    return wire;
  }
  if (item.content && typeof item.content === "object") {
    const fromContent = resolveAgentDescription(item.content as TenantAgentContentInput).trim();
    if (fromContent) {
      return fromContent;
    }
  }
  return SYSTEM_ASSISTANT_AGENTS.find((agent) => agent.id === item.ref)?.description.trim() ?? "";
}

export function resolveAssistantAgentDescriptionFromContent(content: unknown): string {
  if (content == null || typeof content !== "object") {
    return "";
  }
  return resolveAgentDescription(content as TenantAgentContentInput).trim();
}

/**
 * 仅用已加载的 library lookup / 系统内置简介补齐，不额外请求 getAgent。
 * 自建未上架智能体若库中无 description，则空态不展示简介（符合「无则不展示」）。
 */
export function enrichAssistantAgentDescriptions(
  agentShelf: readonly ShelfEntryView[],
  options: AssistantAgentOption[],
  libraryByRef?: Map<string, LibraryItemView>,
): AssistantAgentOption[] {
  if (options.length === 0) {
    return options;
  }

  const optionIds = new Set(options.map((item) => item.id));
  const descriptionById = new Map<string, string>();

  for (const entry of agentShelf) {
    if (entry.targetKind !== "agent" || !optionIds.has(entry.targetId)) {
      continue;
    }
    const libraryItem = libraryByRef?.get(entry.targetId);
    if (libraryItem) {
      const description = resolveAssistantAgentDescriptionFromLibraryItem(libraryItem);
      if (description) {
        descriptionById.set(entry.targetId, description);
        continue;
      }
    }
    const fallback = SYSTEM_ASSISTANT_AGENTS.find((agent) => agent.id === entry.targetId)?.description.trim();
    if (fallback) {
      descriptionById.set(entry.targetId, fallback);
    }
  }

  return options.map((item) => ({
    ...item,
    description: item.description.trim() || descriptionById.get(item.id) || "",
  }));
}

/** 空态展示用：有真实简介才返回，否则空串。 */
export function visibleAssistantAgentDescription(description: string | undefined | null): string {
  const text = description?.trim() ?? "";
  if (!text || text === "暂无简介" || text === "系统预置智能体") {
    return "";
  }
  return text;
}
