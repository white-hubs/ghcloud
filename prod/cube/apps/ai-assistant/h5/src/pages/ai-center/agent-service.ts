import type { LibraryItemView, ShelfEntryView, TenantDescriptorView } from "@cube-ai/contracts";

import type { TenantAgentContentInput } from "@ghcloud/cube-ai-application-service";

import { fetchLibraryAgentLookup, fetchMyAgentDisplayItems, type MyAgentDisplayItem } from "../agent-display-service";
import type { AiCenterAgent } from "./types";
import { agentConsoleClient } from "@/api/agent-console-client";
import { filterUserVisibleLibraryItems, filterUserVisibleShelfEntries } from "@/utils/engine-internal-catalog";

const AGENT_DESCRIPTION_TAG_PREFIX = "ghcloud.agent.description:";
const AGENT_ICON_POOL = ["📰", "🔍", "🚶", "🚨", "📚", "🧠", "🛡️", "⚡"] as const;

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

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickAgentIcon(id: string): string {
  return AGENT_ICON_POOL[hashString(id) % AGENT_ICON_POOL.length] ?? AGENT_ICON_POOL[0];
}

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

function summarizePrompt(prompt: string | null | undefined): string {
  const text = (prompt ?? "")
    .replaceAll(/^#+\s*/gm, "")
    .replaceAll(/\s+/g, " ")
    .trim();
  if (!text) {
    return "暂无简介";
  }
  return text.length > 64 ? `${text.slice(0, 64)}...` : text;
}

function normalizeAgentContent(content: unknown): AgentContentShape {
  if (content != null && typeof content === "object") {
    return content as AgentContentShape;
  }
  return { prompt: "" };
}

function resolveAgentDescription(content: AgentContentShape): string {
  return decodeAgentDescriptionFromTags(content.tags) || content.description?.trim() || summarizePrompt(content.prompt);
}

function resolveLibraryAgentDescription(item: LibraryItemView): string {
  const wireDescription = item.description?.trim();
  if (wireDescription) {
    return wireDescription;
  }
  if (item.tier === "tenant") {
    return resolveAgentDescription(normalizeAgentContent(item.content));
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
    const contentName = content.displayName?.trim();
    if (contentName) {
      return contentName;
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

function mapLibraryAgent(item: LibraryItemView, installedRefs: ReadonlySet<string>): AiCenterAgent {
  const name = resolveLibraryAgentDisplayName(item);
  const description = resolveLibraryAgentDescription(item);
  return {
    id: item.ref,
    libraryRef: item.ref,
    name,
    description,
    detail: description,
    skillSummary: "可添加到我的智能体后在对话助手中使用。",
    createdAt: "2024-06-01",
    categoryId: item.tier === "tenant" ? "tenant-library" : "system-library",
    categoryName: item.tier === "tenant" ? "租户智能体" : "系统智能体",
    icon: pickAgentIcon(item.ref),
    installed: installedRefs.has(item.ref),
  };
}

function mapTenantAgent(view: TenantDescriptorView, options?: { shelf?: ShelfEntryView; library?: LibraryItemView | null }): AiCenterAgent {
  const content = normalizeAgentContent(view.content);
  const name = content?.displayName?.trim() || options?.shelf?.displayName?.trim() || view.name || view.id;
  const description = resolveAgentDescription(content);
  return {
    id: view.id,
    ...(options?.shelf?.id ? { shelfId: options.shelf.id } : {}),
    name,
    description,
    detail: content?.prompt?.trim() || description,
    skillSummary: "可在对话助手中作为智能体使用。",
    createdAt: formatDate(readDescriptorTime(view)),
    categoryId: "my-authored",
    categoryName: "我的智能体",
    icon: pickAgentIcon(view.id),
    visibility: "仅自己可见",
    installed: true,
  };
}

function mapDisplayItemToAgent(item: MyAgentDisplayItem): AiCenterAgent {
  return {
    id: item.id,
    ...(item.libraryRef ? { libraryRef: item.libraryRef } : {}),
    ...(item.shelfId ? { shelfId: item.shelfId } : {}),
    name: item.name,
    description: item.description,
    detail: item.detail,
    skillSummary: "可在对话助手中作为智能体使用。",
    createdAt: item.createdAt,
    categoryId: item.source === "authored" ? "my-authored" : "my-installed",
    categoryName: "我的智能体",
    icon: pickAgentIcon(item.id),
    ...(item.visibility ? { visibility: item.visibility } : {}),
    installed: true,
  };
}

export async function fetchInstalledLibraryAgentRefs(): Promise<Set<string>> {
  const shelf = filterUserVisibleShelfEntries(await agentConsoleClient.myAgents());
  return new Set(shelf.filter((entry) => entry.targetKind === "agent").map((entry) => entry.targetId));
}

export async function fetchLibraryAgents(keyword = ""): Promise<AiCenterAgent[]> {
  const q = keyword.trim();
  const [systemItems, tenantItems, installedRefs] = await Promise.all([
    agentConsoleClient.browseLibraryAgents({ tier: "system", ...(q ? { q } : {}) }),
    agentConsoleClient.browseLibraryAgents({ tier: "tenant", ...(q ? { q } : {}) }).catch(() => [] as LibraryItemView[]),
    fetchInstalledLibraryAgentRefs(),
  ]);
  return filterUserVisibleLibraryItems([...systemItems, ...tenantItems]).map((item) => mapLibraryAgent(item, installedRefs));
}

export async function fetchMyAgents(): Promise<AiCenterAgent[]> {
  return (await fetchMyAgentDisplayItems()).map(mapDisplayItemToAgent);
}

export async function installLibraryAgent(ref: string): Promise<void> {
  await agentConsoleClient.installAgent({ ref });
}

export async function removeMyAgent(agent: AiCenterAgent): Promise<void> {
  if (agent.shelfId) {
    await agentConsoleClient.removeShelfAgent(agent.shelfId);
    return;
  }
  await agentConsoleClient.deleteAgent(agent.id);
}

export async function fetchAgentDetail(id: string): Promise<AiCenterAgent | null> {
  try {
    return mapTenantAgent(await agentConsoleClient.getAgent(id));
  } catch {
    const libraryByRef = await fetchLibraryAgentLookup();
    const library = libraryByRef.get(id);
    if (!library) {
      return null;
    }
    const installedRefs = await fetchInstalledLibraryAgentRefs().catch(() => new Set<string>());
    return mapLibraryAgent(library, installedRefs);
  }
}
