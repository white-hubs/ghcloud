import type { LibraryItemView, ShelfEntryView, TenantDescriptorView } from "@cube-ai/contracts";

import type { TenantAgentContentInput } from "@ghcloud/cube-ai-application-service";

import { agentConsoleClient } from "@/api/agent-console-client";
import { filterUserVisibleLibraryItems, filterUserVisibleShelfEntries, isEngineInternalLibraryRef } from "@/utils/engine-internal-catalog";

const AGENT_DESCRIPTION_TAG_PREFIX = "ghcloud.agent.description:";

type AgentContentShape = TenantAgentContentInput & {
  description?: string | null;
  displayName?: string | null;
  prompt?: string | null;
  tags?: string[] | null;
};

interface DescriptorTimestamps {
  createdAt?: string | number | null;
  updatedAt?: string | number | null;
  createTime?: string | number | null;
  updateTime?: string | number | null;
}

export interface AssistantAgentOption {
  id: string;
  name: string;
  description: string;
}

export interface MyAgentDisplayItem extends AssistantAgentOption {
  detail: string;
  createdAt: string;
  libraryRef?: string;
  shelfId?: string;
  source?: string | null;
  visibility?: string;
}

const FALLBACK_AGENT_OPTIONS = [
  {
    h5Id: "agent-security",
    id: "1934000000000000001",
    name: "安全智能体",
    description: "聚焦安全规范、风险识别和事件处置建议。",
  },
  {
    h5Id: "agent-twin",
    id: "1934000000000000002",
    name: "孪生智能体",
    description: "面向数字孪生与复杂推演场景。",
  },
  {
    h5Id: "agent-energy",
    id: "1934000000000000003",
    name: "业务数据分析",
    description: "通过 MCP 工具查询业务数据库回答数据分析问题。",
  },
] as const;

export const SYSTEM_ASSISTANT_AGENTS: AssistantAgentOption[] = FALLBACK_AGENT_OPTIONS.map((item) => ({
  id: item.id,
  name: item.name,
  description: item.description,
}));

function decodeAgentDescriptionFromTags(tags: readonly string[] | null | undefined): string {
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

function summarizePrompt(prompt: string | null | undefined, maxLength = 60): string {
  const text = (prompt ?? "")
    .replaceAll(/^#+\s*/gm, "")
    .replaceAll(/\s+/g, " ")
    .trim();
  if (!text) {
    return "暂无简介";
  }
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function normalizeAgentContent(content: unknown): AgentContentShape {
  if (content != null && typeof content === "object") {
    return content as AgentContentShape;
  }
  return { prompt: "" };
}

function resolveAgentDescription(content: AgentContentShape): string {
  const fromTags = decodeAgentDescriptionFromTags(content.tags);
  if (fromTags) {
    return fromTags;
  }
  return content.description?.trim() || summarizePrompt(content.prompt);
}

function resolveLibraryAgentDescription(item: LibraryItemView): string {
  const wireDescription = item.description?.trim();
  if (wireDescription) {
    return wireDescription;
  }
  if (item.tier === "tenant") {
    const content = normalizeAgentContent(item.content);
    return resolveAgentDescription(content);
  }
  return "系统预置智能体";
}

function resolveLibraryAgentDisplayName(item: LibraryItemView): string {
  const wireName = item.displayName?.trim();
  if (wireName) {
    return wireName;
  }
  if (item.tier === "tenant") {
    const content = normalizeAgentContent(item.content);
    const fromContent = content.displayName?.trim();
    if (fromContent) {
      return fromContent;
    }
  }
  return item.ref;
}

function formatDate(value: string | number | null | undefined): string {
  if (value == null || value === "") {
    return "2024-06-01";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

function readDescriptorTime(view: TenantDescriptorView): string | number | null | undefined {
  const timestamps = view as TenantDescriptorView & DescriptorTimestamps;
  return timestamps.createdAt ?? timestamps.createTime ?? timestamps.updatedAt ?? timestamps.updateTime;
}

function mapTenantAgentToDisplay(view: TenantDescriptorView, shelf?: ShelfEntryView): MyAgentDisplayItem {
  const content = normalizeAgentContent(view.content);
  const description = resolveAgentDescription(content);
  return {
    id: view.id,
    ...(shelf?.id ? { shelfId: shelf.id } : {}),
    name: content.displayName?.trim() || shelf?.displayName?.trim() || view.name || view.id,
    description,
    detail: content.prompt?.trim() || description,
    createdAt: formatDate(readDescriptorTime(view)),
    source: shelf?.source ?? "authored",
    visibility: "仅自己可见",
  };
}

function mapLibraryAgentToDisplay(entry: ShelfEntryView, library: LibraryItemView): MyAgentDisplayItem {
  const description = resolveLibraryAgentDescription(library);
  return {
    id: entry.targetId,
    libraryRef: entry.targetId,
    shelfId: entry.id,
    name: entry.displayName?.trim() || resolveLibraryAgentDisplayName(library),
    description,
    detail: description,
    createdAt: "2024-06-01",
    source: entry.source,
    visibility: "仅自己可见",
  };
}

function mapShelfFallbackAgent(entry: ShelfEntryView): MyAgentDisplayItem {
  const description = entry.source === "ref" ? "来自智能体库" : "已安装的智能体";
  return {
    id: entry.targetId,
    shelfId: entry.id,
    name: entry.displayName?.trim() || entry.targetId,
    description,
    detail: description,
    createdAt: "2024-06-01",
    source: entry.source,
    visibility: "仅自己可见",
  };
}

export async function fetchLibraryAgentLookup(): Promise<Map<string, LibraryItemView>> {
  const map = new Map<string, LibraryItemView>();
  const lists = await Promise.allSettled([
    agentConsoleClient.browseLibraryAgents({ tier: "system" }),
    agentConsoleClient.browseLibraryAgents({ tier: "tenant" }),
  ]);
  for (const list of lists) {
    if (list.status !== "fulfilled") {
      continue;
    }
    for (const item of filterUserVisibleLibraryItems(list.value)) {
      map.set(item.ref, item);
    }
  }
  return map;
}

export function resolveAgentOptionId(input: unknown, options: readonly AssistantAgentOption[]): string | null {
  const value = Array.isArray(input) ? input[0] : input;
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }
  const knownId = FALLBACK_AGENT_OPTIONS.find((item) => item.h5Id === value || item.id === value)?.id ?? value;
  return options.some((item) => item.id === knownId) ? knownId : knownId;
}

type AuthoredAgentCard = Pick<AssistantAgentOption, "id" | "name" | "description">;

function resolveShelfAgentDisplayName(entry: ShelfEntryView, libraryByRef: ReadonlyMap<string, LibraryItemView>): string {
  const shelfName = entry.displayName?.trim();
  if (shelfName && shelfName !== entry.targetId) {
    return shelfName;
  }
  const libraryItem = libraryByRef.get(entry.targetId);
  if (libraryItem) {
    return resolveLibraryAgentDisplayName(libraryItem);
  }
  return entry.targetId;
}

function buildAssistantAgentOptionsFromShelf(
  agentShelf: readonly ShelfEntryView[],
  libraryByRef: ReadonlyMap<string, LibraryItemView>,
  authoredById: ReadonlyMap<string, AuthoredAgentCard | null>,
): AssistantAgentOption[] {
  const options: AssistantAgentOption[] = [];
  const existingIds = new Set<string>();

  for (const entry of agentShelf) {
    if (entry.targetKind !== "agent" || entry.runnableStatus !== "runnable") {
      continue;
    }
    if (isEngineInternalLibraryRef("agent", entry.targetId)) {
      continue;
    }
    if (existingIds.has(entry.targetId)) {
      continue;
    }

    if (entry.source === "ref") {
      const libraryItem = libraryByRef.get(entry.targetId);
      if (!libraryItem && entry.pinVersionNo == null) {
        continue;
      }
      options.push({
        id: entry.targetId,
        name: resolveShelfAgentDisplayName(entry, libraryByRef),
        description: libraryItem == null ? "来自智能体库" : resolveLibraryAgentDescription(libraryItem),
      });
      existingIds.add(entry.targetId);
      continue;
    }

    if (entry.source === "authored") {
      const card = authoredById.get(entry.targetId);
      if (!card) {
        continue;
      }
      options.push(card);
      existingIds.add(entry.targetId);
    }
  }

  return options;
}

export async function fetchMyAgentDisplayItems(options?: { enabled?: boolean; runnableOnly?: boolean }): Promise<MyAgentDisplayItem[]> {
  const params = options?.enabled === undefined ? undefined : { enabled: options.enabled };
  const shelf = filterUserVisibleShelfEntries(await agentConsoleClient.myAgents(params));
  const agentShelf = shelf.filter((entry) => {
    if (entry.targetKind !== "agent") {
      return false;
    }
    return options?.runnableOnly === true ? entry.runnableStatus === "runnable" : true;
  });
  const refEntries = agentShelf.filter((entry) => entry.source === "ref");
  const libraryByRef = refEntries.length > 0 ? await fetchLibraryAgentLookup() : new Map<string, LibraryItemView>();
  return Promise.all(
    agentShelf.map(async (entry) => {
      const library = libraryByRef.get(entry.targetId);
      if (library) {
        return mapLibraryAgentToDisplay(entry, library);
      }
      if (entry.source === "authored") {
        try {
          return mapTenantAgentToDisplay(await agentConsoleClient.getAgent(entry.targetId), entry);
        } catch {
          return mapShelfFallbackAgent(entry);
        }
      }
      return mapShelfFallbackAgent(entry);
    }),
  );
}

export async function fetchAssistantAgentOptions(): Promise<AssistantAgentOption[]> {
  const shelf = filterUserVisibleShelfEntries(await agentConsoleClient.myAgents({ enabled: true }));
  const agentShelf = shelf.filter((entry) => entry.targetKind === "agent");
  if (agentShelf.length === 0) {
    return [];
  }

  const refEntries = agentShelf.filter((entry) => entry.source === "ref");
  const authoredEntries = agentShelf.filter((entry) => entry.source === "authored");
  const libraryByRef = refEntries.length > 0 ? await fetchLibraryAgentLookup() : new Map<string, LibraryItemView>();

  const authoredById = new Map<string, AuthoredAgentCard | null>();
  await Promise.all(
    authoredEntries.map(async (entry) => {
      try {
        const item = mapTenantAgentToDisplay(await agentConsoleClient.getAgent(entry.targetId), entry);
        authoredById.set(entry.targetId, { id: item.id, name: item.name, description: item.description });
      } catch {
        authoredById.set(entry.targetId, null);
      }
    }),
  );

  const options = buildAssistantAgentOptionsFromShelf(agentShelf, libraryByRef, authoredById);
  return options;
}
