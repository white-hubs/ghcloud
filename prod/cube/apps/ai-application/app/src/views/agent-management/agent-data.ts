import type { LibraryItemView, ShelfEntryView, TenantDescriptorView } from "@cube-ai/contracts";
import type { Component } from "vue";

import type { TenantAgentContentInput, TenantAgentView } from "@ghcloud/cube-ai-application-service";
import { AppstoreOutlined, CodeOutlined, SafetyCertificateOutlined, ThunderboltOutlined, TranslationOutlined } from "@ghcloud/cube-ui";

import { agentConsoleClient } from "../../api/agent-console-client";
import { filterUserVisibleLibraryItems, filterUserVisibleShelfEntries } from "../../utils/engine-internal-catalog";
import { buildTagsWithAgentAvatar, parseAgentAvatarFromTags, resolveAgentAvatarUrlFromContent } from "./agent-avatar";
import { buildTagsWithKnowledgeRefs, parseKnowledgeRefsFromTags, type AgentKnowledgeRef } from "./agent-knowledge-refs";
import { filterBindableSkillRefs } from "./agent-skill-binding";

/** 服务端 agent content schema 无 description 字段，简介经 tags 持久化（ghcloud 约定）。 */
const AGENT_DESCRIPTION_TAG_PREFIX = "ghcloud.agent.description:";

function encodeAgentDescriptionTag(description: string): string {
  return `${AGENT_DESCRIPTION_TAG_PREFIX}${encodeURIComponent(description)}`;
}

function isAgentDescriptionTag(tag: string): boolean {
  return tag.startsWith(AGENT_DESCRIPTION_TAG_PREFIX);
}

function decodeAgentDescriptionFromTags(tags: string[] | undefined): string {
  if (!tags?.length) {
    return "";
  }
  for (const tag of tags) {
    if (!isAgentDescriptionTag(tag)) {
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

function buildAgentDescriptionTags(description: string, existingTags?: string[]): string[] | undefined {
  const preserved = (existingTags ?? []).filter((tag) => !isAgentDescriptionTag(tag));
  const trimmed = description.trim();
  if (!trimmed) {
    return preserved.length > 0 ? preserved : undefined;
  }
  return [...preserved, encodeAgentDescriptionTag(trimmed)];
}

export function resolveAgentDescription(content: TenantAgentContentInput): string {
  const fromTags = decodeAgentDescriptionFromTags(content.tags);
  if (fromTags) {
    return fromTags;
  }
  return content.description?.trim() ?? "";
}

function resolveLibraryAgentDescription(item: LibraryItemView): string {
  const wireDescription = item.description?.trim();
  if (wireDescription) {
    return wireDescription;
  }
  if (item.tier === "tenant" && item.content && typeof item.content === "object") {
    const content = item.content as TenantAgentContentInput;
    const fromContent = resolveAgentDescription(content);
    if (fromContent) {
      return fromContent;
    }
    return summarizePrompt(content.prompt);
  }
  return item.tier === "system" ? "系统预置智能体" : "暂无简介";
}

function resolveLibraryAgentDisplayName(item: LibraryItemView): string {
  const wireName = item.displayName?.trim();
  if (wireName) {
    return wireName;
  }
  if (item.tier === "tenant" && item.content && typeof item.content === "object") {
    const content = item.content as TenantAgentContentInput;
    const fromContent = content.displayName?.trim();
    if (fromContent) {
      return fromContent;
    }
  }
  return item.ref;
}

export interface AgentCardItem {
  id: string;
  name: string;
  description: string;
  status: "published" | "draft";
  icon: Component;
  iconClass: string;
  /** 自定义头像 URL；缺省时卡片仍用 icon / iconClass */
  avatarUrl?: string;
  libraryRef?: string;
  /** 来自智能体库安装（shelf ref），不可编辑租户 descriptor */
  fromLibrary?: boolean;
  /** shelf 条目 id，用于 removeShelfAgent */
  shelfId?: string;
  headVersionNo?: number;
  publishedVersionNo?: number | null;
  hasUnpublishedChanges?: boolean;
  /** 是否已上架到智能体库（marketplace listing） */
  listed?: boolean;
  listedInLibrary?: boolean;
  /** 本人创作且已上架，可在智能体库页下架 */
  canUnlist?: boolean;
  /** 是否可进入编辑页（租户自建 descriptor） */
  editable?: boolean;
  /** 智能体库：是否已添加到我的智能体（含自研 + 库安装） */
  installed?: boolean;
  /** 库安装版本落后于库中最新版 */
  hasUpdate?: boolean;
}

const AGENT_ICON_POOL = [
  { icon: SafetyCertificateOutlined, iconClass: "blue" },
  { icon: ThunderboltOutlined, iconClass: "pink" },
  { icon: CodeOutlined, iconClass: "indigo" },
  { icon: AppstoreOutlined, iconClass: "orange" },
  { icon: TranslationOutlined, iconClass: "rose" },
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.codePointAt(i)) >>> 0;
  }
  return hash;
}

function pickAgentVisual(id: string): { icon: Component; iconClass: string } {
  const visual = AGENT_ICON_POOL[hashString(id) % AGENT_ICON_POOL.length] ?? AGENT_ICON_POOL[0];
  return { icon: visual.icon, iconClass: visual.iconClass };
}

function summarizePrompt(prompt: string | undefined): string {
  const text = (prompt ?? "")
    .replaceAll(/^#+\s*/gm, "")
    .replaceAll(/\s+/g, " ")
    .trim();
  if (!text) {
    return "暂无简介";
  }
  return text.length > 60 ? `${text.slice(0, 60)}…` : text;
}

type AgentDescriptorView = TenantAgentView | TenantDescriptorView;

export function deriveDescriptorName(displayName: string): string {
  const trimmed = displayName.trim();
  const latin = trimmed
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
  const base = latin.length >= 2 ? latin.slice(0, 40) : "agent";
  const suffix = Date.now().toString(36).slice(-6);
  return `${base}-${suffix}`;
}

export function mapDescriptorToCard(
  view: AgentDescriptorView,
  listing?: { listed: boolean } | null,
  options?: { editable?: boolean },
): AgentCardItem {
  const content = (view.content ?? { prompt: "" }) as TenantAgentContentInput;
  const visual = pickAgentVisual(view.id);
  const avatarUrl = resolveAgentAvatarUrlFromContent(content);
  return {
    id: view.id,
    name: content.displayName?.trim() || view.name,
    description: resolveAgentDescription(content) || summarizePrompt(content.prompt),
    status: view.status as "published" | "draft",
    icon: visual.icon,
    iconClass: visual.iconClass,
    ...(avatarUrl ? { avatarUrl } : {}),
    headVersionNo: view.headVersionNo,
    publishedVersionNo: view.publishedVersionNo,
    hasUnpublishedChanges: "hasUnpublishedChanges" in view ? view.hasUnpublishedChanges : undefined,
    listed: listing?.listed ?? false,
    listedInLibrary: listing?.listed === true,
    editable: options?.editable ?? false,
  };
}

export function mapLibraryItemToCard(
  item: LibraryItemView,
  ownedRefs?: ReadonlySet<string>,
  shelfByTarget?: ReadonlyMap<string, ShelfEntryView>,
  authoredIds?: ReadonlySet<string>,
): AgentCardItem {
  const visual = pickAgentVisual(item.ref);
  const shelfEntry = shelfByTarget?.get(item.ref);
  const latestVersionNo = item.tier === "tenant" && item.sharedVersionNo != null ? item.sharedVersionNo : undefined;
  const hasUpdate =
    shelfEntry != null && latestVersionNo != null && shelfEntry.pinVersionNo != null && latestVersionNo > shelfEntry.pinVersionNo;
  const avatarUrl =
    item.content && typeof item.content === "object" ? resolveAgentAvatarUrlFromContent(item.content as TenantAgentContentInput) : "";

  return {
    id: item.ref,
    libraryRef: item.ref,
    name: resolveLibraryAgentDisplayName(item),
    description: resolveLibraryAgentDescription(item),
    status: "published",
    icon: visual.icon,
    iconClass: visual.iconClass,
    ...(avatarUrl ? { avatarUrl } : {}),
    editable: false,
    installed: ownedRefs?.has(item.ref) ?? false,
    hasUpdate,
    ...(shelfEntry?.id ? { shelfId: shelfEntry.id } : {}),
    canUnlist: item.tier === "tenant" && item.ref.startsWith("agt_") && (authoredIds?.has(item.ref) ?? false),
  };
}

/** @deprecated 使用 fetchOwnedAgentRefs */
export async function fetchInstalledLibraryAgentRefs(): Promise<Set<string>> {
  const shelf = await agentConsoleClient.myAgents({ source: "ref" });
  return new Set(shelf.filter((entry) => entry.targetKind === "agent").map((entry) => entry.targetId));
}

/** 货架上已拥有的智能体 ref（含库安装 + 本人创作），用于智能体库「已添加」态。 */
export async function fetchOwnedAgentRefs(): Promise<Set<string>> {
  const shelf = await agentConsoleClient.myAgents();
  return new Set(shelf.filter((entry) => entry.targetKind === "agent").map((entry) => entry.targetId));
}

export function mapShelfEntryToCard(entry: ShelfEntryView): AgentCardItem {
  const visual = pickAgentVisual(entry.targetId);
  const runnable = entry.runnableStatus === "runnable";
  return {
    id: entry.targetId,
    shelfId: entry.id,
    fromLibrary: entry.source === "ref",
    name: entry.displayName?.trim() || entry.targetId,
    description: entry.source === "ref" ? "来自智能体库" : "已安装的智能体",
    status: runnable ? "published" : "draft",
    icon: visual.icon,
    iconClass: visual.iconClass,
    editable: false,
  };
}

/** 当前用户货架中 source=authored 的 agent（本人创作、可编辑/发布）。 */
export async function isCurrentUserAuthoredAgent(agentId: string): Promise<boolean> {
  const shelf = await agentConsoleClient.myAgents({ source: "authored" });
  return shelf.some((entry) => entry.targetKind === "agent" && entry.targetId === agentId);
}

async function resolveAgentListing(agentId: string): Promise<{ listed: boolean } | null> {
  try {
    return await agentConsoleClient.getAgentListing(agentId);
  } catch {
    return null;
  }
}

async function buildLibraryAgentLookup(): Promise<Map<string, LibraryItemView>> {
  const map = new Map<string, LibraryItemView>();
  for (const tier of ["system", "tenant"] as const) {
    try {
      const items = filterUserVisibleLibraryItems(await agentConsoleClient.browseLibraryAgents({ tier }));
      for (const item of items) {
        map.set(item.ref, item);
      }
    } catch {
      /* 单 tier 失败不阻塞其余来源 */
    }
  }
  return map;
}

/** 智能体库 ref → displayName，供货架/助手等复用。 */
export async function fetchLibraryAgentLookup(): Promise<Map<string, LibraryItemView>> {
  return buildLibraryAgentLookup();
}

/** shelf 条目展示名：优先货架 displayName，库安装 ref 回落到库 catalog。 */
export function resolveShelfAgentDisplayName(entry: ShelfEntryView, libraryByRef: Map<string, LibraryItemView>): string {
  const shelfName = entry.displayName?.trim();
  if (shelfName && shelfName !== entry.targetId) {
    return shelfName;
  }
  const libraryItem = libraryByRef.get(entry.targetId);
  const libraryName = libraryItem?.displayName?.trim();
  if (libraryName) {
    return libraryName;
  }
  return entry.targetId;
}

export interface AgentCardDetail extends AgentCardItem {
  prompt?: string;
}

function mapAuthoredShelfSummary(
  entry: ShelfEntryView,
  view: TenantDescriptorView | null | undefined,
  listedInLibrary: boolean,
): AgentCardItem {
  const visual = pickAgentVisual(entry.targetId);
  if (view) {
    const card = mapDescriptorToCard(view, { listed: listedInLibrary }, { editable: true });
    return {
      ...card,
      shelfId: entry.id,
      fromLibrary: false,
    };
  }
  return {
    id: entry.targetId,
    shelfId: entry.id,
    fromLibrary: false,
    name: entry.displayName?.trim() || entry.targetId,
    description: "暂无简介",
    status: entry.runnableStatus === "runnable" ? "published" : "draft",
    icon: visual.icon,
    iconClass: visual.iconClass,
    editable: true,
    listedInLibrary,
  };
}

function enrichRefShelfEntry(entry: ShelfEntryView, libraryByRef: Map<string, LibraryItemView>): AgentCardItem {
  const card = mapShelfEntryToCard(entry);
  const libraryItem = libraryByRef.get(entry.targetId);
  if (!libraryItem) {
    return card;
  }
  const latestVersionNo = libraryItem.tier === "tenant" && libraryItem.sharedVersionNo != null ? libraryItem.sharedVersionNo : undefined;
  const hasUpdate = entry.source === "ref" && latestVersionNo != null && entry.pinVersionNo != null && latestVersionNo > entry.pinVersionNo;
  const avatarUrl =
    libraryItem.content && typeof libraryItem.content === "object"
      ? resolveAgentAvatarUrlFromContent(libraryItem.content as TenantAgentContentInput)
      : "";

  return {
    ...card,
    name: resolveShelfAgentDisplayName(entry, libraryByRef),
    description: resolveLibraryAgentDescription(libraryItem) || card.description,
    hasUpdate,
    ...(avatarUrl ? { avatarUrl } : {}),
  };
}

function buildLibraryCardsFromBrowse(
  systemItems: LibraryItemView[],
  tenantItems: LibraryItemView[],
  allShelf: ShelfEntryView[],
): AgentCardItem[] {
  const agentShelf = allShelf.filter((entry) => entry.targetKind === "agent");
  const ownedRefs = new Set(agentShelf.map((entry) => entry.targetId));
  const refShelf = agentShelf.filter((entry) => entry.source === "ref");
  const authoredIds = new Set(agentShelf.filter((entry) => entry.source === "authored").map((entry) => entry.targetId));
  const shelfByTarget = new Map(refShelf.map((entry) => [entry.targetId, entry]));

  return filterUserVisibleLibraryItems([...systemItems, ...tenantItems]).map((item) =>
    mapLibraryItemToCard(item, ownedRefs, shelfByTarget, authoredIds),
  );
}

async function buildMyAgentCardsFromShelf(
  allShelf: ShelfEntryView[],
  libraryByRef: Map<string, LibraryItemView>,
): Promise<AgentCardItem[]> {
  const agentShelf = allShelf.filter((entry) => entry.targetKind === "agent");
  const refEntries = agentShelf.filter((entry) => entry.source === "ref");
  const authoredEntries = agentShelf.filter((entry) => entry.source === "authored");

  const authoredById = new Map<string, TenantDescriptorView>();
  if (authoredEntries.length > 0) {
    try {
      const listed = await agentConsoleClient.listAgents();
      for (const view of listed) {
        authoredById.set(view.id, view);
      }
    } catch {
      /* 列表失败时退回货架 displayName */
    }
  }

  const authoredCards = authoredEntries.map((entry) =>
    mapAuthoredShelfSummary(entry, authoredById.get(entry.targetId), libraryByRef.has(entry.targetId)),
  );
  const refCards = refEntries.map((entry) => enrichRefShelfEntry(entry, libraryByRef));
  return [...authoredCards, ...refCards];
}

/** 智能体库：系统预置 + 租户已上架智能体。 */
export async function fetchLibraryAgentCards(opts?: { q?: string }): Promise<AgentCardItem[]> {
  const q = opts?.q?.trim();
  const browseOpts = q ? { q } : {};
  // 只拉一次 myAgents（旧实现同时调了 fetchOwnedAgentRefs + myAgents，重复一次）
  const [systemItems, tenantItems, allShelfRaw] = await Promise.all([
    agentConsoleClient.browseLibraryAgents({ tier: "system", ...browseOpts }),
    agentConsoleClient.browseLibraryAgents({ tier: "tenant", ...browseOpts }),
    agentConsoleClient.myAgents(),
  ]);
  const allShelf = filterUserVisibleShelfEntries(allShelfRaw);
  return buildLibraryCardsFromBrowse(systemItems, tenantItems, allShelf);
}

/** 我的智能体：货架 authored（本人创作）+ ref（库安装）。 */
export async function fetchMyAgentCards(): Promise<AgentCardItem[]> {
  const shelf = filterUserVisibleShelfEntries(await agentConsoleClient.myAgents());
  const agentShelf = shelf.filter((entry) => entry.targetKind === "agent");
  const refEntries = agentShelf.filter((entry) => entry.source === "ref");
  const libraryByRef = refEntries.length > 0 ? await buildLibraryAgentLookup() : new Map<string, LibraryItemView>();
  return buildMyAgentCardsFromShelf(shelf, libraryByRef);
}

/**
 * Hub 页一次拉齐「库 + 我的」：myAgents / browseLibrary 各只请求一轮，避免两 tab 并行加载时的重复。
 */
export async function fetchAgentHubSnapshot(): Promise<{
  libraryAgents: AgentCardItem[];
  myAgents: AgentCardItem[];
}> {
  const [systemItems, tenantItems, allShelfRaw] = await Promise.all([
    agentConsoleClient.browseLibraryAgents({ tier: "system" }),
    agentConsoleClient.browseLibraryAgents({ tier: "tenant" }),
    agentConsoleClient.myAgents(),
  ]);
  const allShelf = filterUserVisibleShelfEntries(allShelfRaw);
  const libraryByRef = new Map<string, LibraryItemView>();
  for (const item of filterUserVisibleLibraryItems([...systemItems, ...tenantItems])) {
    libraryByRef.set(item.ref, item);
  }

  const [libraryAgents, myAgents] = await Promise.all([
    Promise.resolve(buildLibraryCardsFromBrowse(systemItems, tenantItems, allShelf)),
    buildMyAgentCardsFromShelf(allShelf, libraryByRef),
  ]);
  return { libraryAgents, myAgents };
}

export function formatDescriptorStatusLabel(view: {
  status: string;
  publishedVersionNo?: number | null;
  hasUnpublishedChanges?: boolean;
}): string {
  return formatAgentStatusLabel({
    id: "",
    name: "",
    description: "",
    status: view.status as "published" | "draft",
    icon: AppstoreOutlined,
    iconClass: "blue",
    publishedVersionNo: view.publishedVersionNo,
    hasUnpublishedChanges: view.hasUnpublishedChanges,
  });
}

export function formatAgentStatusLabel(item: AgentCardItem): string {
  if (item.fromLibrary) {
    if (item.hasUpdate) {
      return "有新版本";
    }
    return item.status === "published" ? "已安装" : "不可用";
  }
  if (item.listedInLibrary ?? item.listed) {
    return "已上架";
  }
  if (item.status === "draft") {
    return "草稿";
  }
  if (item.hasUnpublishedChanges) {
    return "已发布 · 有未发布修改";
  }
  if (item.publishedVersionNo != null) {
    return `已发布 v${item.publishedVersionNo}`;
  }
  return "已发布";
}

export interface AgentFormState {
  name: string;
  description: string;
  model: string;
  prompt: string;
  skillRefs: string[];
  ruleRefs: string[];
  temperature: number | null;
  maxDepth: number | null;
  tags: string[];
  knowledgeRefs: AgentKnowledgeRef[];
  avatarUrl: string;
  avatarFileId: string;
}

export function parseAgentContentToForm(view: AgentDescriptorView): AgentFormState {
  const content = (view.content ?? { prompt: "" }) as TenantAgentContentInput;
  const tags = [...(content.tags ?? [])];
  const avatar = parseAgentAvatarFromTags(tags);
  return {
    name: content.displayName?.trim() || view.name,
    description: resolveAgentDescription(content),
    model: content.modelConfig?.model?.trim() ?? "",
    prompt: content.prompt?.trim() ?? "",
    skillRefs: filterBindableSkillRefs(content.skillRefs ?? []),
    ruleRefs: [...(content.ruleRefs ?? [])],
    temperature: content.modelConfig?.temperature ?? null,
    maxDepth: content.maxDepth ?? null,
    tags,
    knowledgeRefs: parseKnowledgeRefsFromTags(tags),
    avatarUrl: avatar.avatarUrl,
    avatarFileId: avatar.avatarFileId,
  };
}

export function buildAgentContentFromForm(form: AgentFormState): TenantAgentContentInput {
  const content: TenantAgentContentInput = {
    prompt: form.prompt.trim(),
  };
  const displayName = form.name.trim();
  if (displayName) {
    content.displayName = displayName;
  }
  // description / avatar / knowledge tags 分轨：依次叠写，互不覆盖。
  const withDescription = buildAgentDescriptionTags(form.description, form.tags) ?? (form.tags ?? []).filter(Boolean);
  const withAvatar = buildTagsWithAgentAvatar(withDescription, {
    avatarUrl: form.avatarUrl,
    avatarFileId: form.avatarFileId,
  });
  const mergedTags = buildTagsWithKnowledgeRefs(withAvatar, form.knowledgeRefs ?? []);
  if (mergedTags.length > 0) {
    content.tags = mergedTags;
  }
  const model = form.model.trim();
  const modelConfig: TenantAgentContentInput["modelConfig"] = {};
  if (model) {
    modelConfig.model = model;
  }
  if (form.temperature != null && Number.isFinite(form.temperature)) {
    modelConfig.temperature = form.temperature;
  }
  if (Object.keys(modelConfig).length > 0) {
    content.modelConfig = modelConfig;
  }
  if (form.maxDepth != null && Number.isFinite(form.maxDepth) && form.maxDepth > 0) {
    content.maxDepth = Math.floor(form.maxDepth);
  }
  // 始终写入 skillRefs（含空数组），避免清空绑定后服务端残留旧值；并剔除平台默认技能。
  content.skillRefs = filterBindableSkillRefs(form.skillRefs);
  if (form.ruleRefs.length > 0) {
    content.ruleRefs = [...form.ruleRefs];
  }
  return content;
}

export function formatAgentSavedTime(timestamp: number | null | undefined): string {
  if (timestamp == null || !Number.isFinite(timestamp)) {
    return "";
  }
  const date = new Date(timestamp);
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function resolveAgentEditPath(agentId: string): string {
  return `/agents/edit/${encodeURIComponent(agentId)}`;
}

/** 详情弹层 / 编辑页：按需拉取完整智能体数据。 */
export async function fetchAgentCardDetail(agentId: string, mode: "library" | "mine"): Promise<AgentCardDetail | null> {
  try {
    if (agentId.startsWith("agt_")) {
      const view = await agentConsoleClient.getAgent(agentId);
      const listing = await resolveAgentListing(agentId);
      const content = (view.content ?? { prompt: "" }) as TenantAgentContentInput;
      const card = mapDescriptorToCard(view as TenantDescriptorView, listing, { editable: mode === "mine" });
      const detail: AgentCardDetail = {
        ...card,
        prompt: content.prompt?.trim() || "",
      };
      if (mode !== "mine") {
        return detail;
      }
      const shelf = await agentConsoleClient.myAgents();
      const shelfEntry = shelf.find((entry) => entry.targetKind === "agent" && entry.targetId === agentId);
      return {
        ...detail,
        shelfId: shelfEntry?.id,
        fromLibrary: false,
        editable: true,
      };
    }

    const item = await agentConsoleClient.getLibraryAgent(agentId);
    const content =
      item.tier === "tenant" && item.content && typeof item.content === "object" ? (item.content as TenantAgentContentInput) : null;
    const ownedRefs = await fetchOwnedAgentRefs();
    const allShelf = await agentConsoleClient.myAgents();
    const refShelf = allShelf.filter((entry) => entry.targetKind === "agent" && entry.source === "ref");
    const authoredIds = new Set(
      allShelf.filter((entry) => entry.targetKind === "agent" && entry.source === "authored").map((entry) => entry.targetId),
    );
    const shelfByTarget = new Map(refShelf.map((entry) => [entry.targetId, entry]));
    const shelfEntry = shelfByTarget.get(agentId);
    const card = mapLibraryItemToCard(item, ownedRefs, shelfByTarget, authoredIds);
    const prompt = content?.prompt?.trim() || "";
    if (mode === "mine") {
      return {
        ...card,
        editable: false,
        fromLibrary: true,
        shelfId: shelfEntry?.id,
        installed: true,
        prompt,
      };
    }
    return { ...card, prompt };
  } catch {
    return null;
  }
}

export function resolveAgentEditId(route: { params: Record<string, unknown>; query: Record<string, unknown> }): string | null {
  const paramId = route.params.id;
  if (typeof paramId === "string" && paramId.trim()) {
    return paramId.trim();
  }
  const queryId = route.query.id;
  if (typeof queryId === "string" && queryId.trim()) {
    return queryId.trim();
  }
  return null;
}
