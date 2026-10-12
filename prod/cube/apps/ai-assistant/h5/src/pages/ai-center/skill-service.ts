import type { LibraryItemView, ShelfEntryView, TenantDescriptorView } from "@cube-ai/contracts";

import { agentConsoleClient } from "../../api/agent-console-client";
import type { SkillItem } from "../chat/types";
import type { AiCenterSkill, AiCenterSkillCategory } from "./types";
import { filterUserVisibleLibraryItems, filterUserVisibleShelfEntries } from "@/utils/engine-internal-catalog";

const SKILL_CATEGORY_TAG_PREFIX = "ghcloud.skill.category:";

type SkillCategoryCode = "DATA_QUERY" | "WORK_EXECUTION" | "ANALYSIS_REPORT" | "KNOWLEDGE_CONSULT" | "INTELLIGENT_REMIND";

interface SkillContentShape {
  displayName?: string | null;
  description?: string | null;
  instructions?: string | null;
  tags?: readonly string[] | null;
  version?: string | null;
}

const KNOWN_SKILL_CATEGORIES: AiCenterSkillCategory[] = [
  { id: "DATA_QUERY", name: "数据查询", shortName: "查", color: "#2f80ed" },
  { id: "WORK_EXECUTION", name: "工作执行", shortName: "做", color: "#22c55e" },
  { id: "ANALYSIS_REPORT", name: "分析汇报", shortName: "报", color: "#8b5cf6" },
  { id: "KNOWLEDGE_CONSULT", name: "知识咨询", shortName: "问", color: "#f59e0b" },
  { id: "INTELLIGENT_REMIND", name: "智能提醒", shortName: "催", color: "#ef4444" },
];

const SKILL_CATEGORY_LABELS: Record<SkillCategoryCode, string> = {
  DATA_QUERY: "数据查询",
  WORK_EXECUTION: "工作执行",
  ANALYSIS_REPORT: "分析汇报",
  KNOWLEDGE_CONSULT: "知识咨询",
  INTELLIGENT_REMIND: "智能提醒",
};

const SKILL_CATEGORY_ICONS: Record<SkillCategoryCode, string> = {
  DATA_QUERY: "📊",
  WORK_EXECUTION: "🛠️",
  ANALYSIS_REPORT: "📈",
  KNOWLEDGE_CONSULT: "📚",
  INTELLIGENT_REMIND: "⏰",
};

const FALLBACK_CATEGORY_COLORS = ["#2f80ed", "#22c55e", "#8b5cf6", "#f59e0b", "#ef4444"];

function isSkillCategoryCode(value: string): value is SkillCategoryCode {
  return value in SKILL_CATEGORY_LABELS;
}

function decodeSkillCategoryFromTags(tags?: readonly string[] | null): SkillCategoryCode | undefined {
  if (!tags?.length) {
    return undefined;
  }
  for (const tag of tags) {
    if (!tag.startsWith(SKILL_CATEGORY_TAG_PREFIX)) {
      continue;
    }
    const code = tag.slice(SKILL_CATEGORY_TAG_PREFIX.length);
    if (isSkillCategoryCode(code)) {
      return code;
    }
  }
  return undefined;
}

function resolveSkillCategoryId(tags?: readonly string[] | null): SkillCategoryCode {
  return decodeSkillCategoryFromTags(tags) ?? "WORK_EXECUTION";
}

function resolveSkillCategoryName(categoryId: string): string {
  return isSkillCategoryCode(categoryId) ? SKILL_CATEGORY_LABELS[categoryId] : categoryId;
}

function resolveSkillCategoryIcon(categoryId: string): string {
  return isSkillCategoryCode(categoryId) ? SKILL_CATEGORY_ICONS[categoryId] : "⚡";
}

function buildSkillCategory(categoryId: string, index: number): AiCenterSkillCategory {
  const known = KNOWN_SKILL_CATEGORIES.find((category) => category.id === categoryId);
  if (known) {
    return known;
  }
  const name = resolveSkillCategoryName(categoryId);
  return {
    id: categoryId,
    name,
    shortName: name.slice(0, 1) || "技",
    color: FALLBACK_CATEGORY_COLORS[index % FALLBACK_CATEGORY_COLORS.length] ?? "#2f80ed",
  };
}

function normalizeSkillContent(content?: unknown): SkillContentShape {
  return content != null && typeof content === "object" ? (content as SkillContentShape) : {};
}

function buildFallbackDescription(content: SkillContentShape, fallback?: string | null): string {
  const description = content.description?.trim() || fallback?.trim();
  if (description) {
    return description;
  }
  const instructions = content.instructions?.trim();
  return instructions ? instructions.slice(0, 80) : "暂无描述";
}

function mapLibrarySkill(
  item: LibraryItemView,
  ownedRefs: ReadonlySet<string>,
  shelfByTarget: ReadonlyMap<string, ShelfEntryView>,
): AiCenterSkill {
  const content = item.tier === "tenant" ? normalizeSkillContent(item.content) : {};
  const tags = content.tags ?? item.tags;
  const categoryId = resolveSkillCategoryId(tags);
  const shelfEntry = shelfByTarget.get(item.ref);

  return {
    id: item.ref,
    libraryRef: item.ref,
    name: content.displayName?.trim() || item.displayName?.trim() || item.ref,
    description: buildFallbackDescription(content, item.description),
    categoryId,
    categoryName: resolveSkillCategoryName(categoryId),
    icon: resolveSkillCategoryIcon(categoryId),
    installed: ownedRefs.has(item.ref),
    ...(shelfEntry?.id ? { shelfId: shelfEntry.id } : {}),
    source: "library",
  };
}

function mapTenantSkill(view: TenantDescriptorView, shelfEntry?: ShelfEntryView): AiCenterSkill {
  const content = normalizeSkillContent(view.content);
  const categoryId = resolveSkillCategoryId(content.tags);

  return {
    id: view.id,
    name: content.displayName?.trim() || view.name?.trim() || view.id,
    description: buildFallbackDescription(content),
    categoryId,
    categoryName: resolveSkillCategoryName(categoryId),
    icon: resolveSkillCategoryIcon(categoryId),
    installed: true,
    ...(shelfEntry?.id ? { shelfId: shelfEntry.id } : {}),
    source: "authored",
  };
}

function mapShelfSkill(entry: ShelfEntryView, libraryByRef: ReadonlyMap<string, LibraryItemView>): AiCenterSkill {
  const libraryItem = libraryByRef.get(entry.targetId);
  const content = libraryItem?.tier === "tenant" ? normalizeSkillContent(libraryItem.content) : {};
  const tags = content.tags ?? libraryItem?.tags;
  const categoryId = resolveSkillCategoryId(tags);

  return {
    id: entry.targetId,
    shelfId: entry.id,
    ...(entry.source === "ref" ? { libraryRef: entry.targetId } : {}),
    name: entry.displayName?.trim() || content.displayName?.trim() || libraryItem?.displayName?.trim() || entry.targetId,
    description: buildFallbackDescription(content, libraryItem?.description),
    categoryId,
    categoryName: resolveSkillCategoryName(categoryId),
    icon: resolveSkillCategoryIcon(categoryId),
    installed: true,
    source: entry.source ?? "ref",
  };
}

export function deriveSkillCategories(skills: readonly AiCenterSkill[]): AiCenterSkillCategory[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const skill of skills) {
    if (!skill.categoryId || seen.has(skill.categoryId)) {
      continue;
    }
    ids.push(skill.categoryId);
    seen.add(skill.categoryId);
  }
  return ids.map((id, index) => {
    const category = buildSkillCategory(id, index);
    const skill = skills.find((item) => item.categoryId === id);
    return skill?.categoryName ? { ...category, name: skill.categoryName } : category;
  });
}

async function fetchOwnedSkillRefs(): Promise<{ ownedRefs: Set<string>; shelfByTarget: Map<string, ShelfEntryView> }> {
  const shelf = filterUserVisibleShelfEntries(await agentConsoleClient.mySkills());
  const skillShelf = shelf.filter((entry) => entry.targetKind === "skill");
  const ownedRefs = new Set(skillShelf.map((entry) => entry.targetId));
  const refShelf = skillShelf.filter((entry) => entry.source === "ref");
  return {
    ownedRefs,
    shelfByTarget: new Map(refShelf.map((entry) => [entry.targetId, entry])),
  };
}

async function buildLibrarySkillLookup(): Promise<Map<string, LibraryItemView>> {
  const result = new Map<string, LibraryItemView>();
  const [systemItems, tenantItems] = await Promise.allSettled([
    agentConsoleClient.browseLibrarySkills({ tier: "system" }),
    agentConsoleClient.browseLibrarySkills({ tier: "tenant" }),
  ]);

  if (systemItems.status === "fulfilled") {
    for (const item of filterUserVisibleLibraryItems(systemItems.value)) {
      result.set(item.ref, item);
    }
  }
  if (tenantItems.status === "fulfilled") {
    for (const item of filterUserVisibleLibraryItems(tenantItems.value)) {
      result.set(item.ref, item);
    }
  }
  return result;
}

export async function fetchLibrarySkills(): Promise<AiCenterSkill[]> {
  const [systemItems, tenantItems, relation] = await Promise.all([
    agentConsoleClient.browseLibrarySkills({ tier: "system" }),
    agentConsoleClient.browseLibrarySkills({ tier: "tenant" }),
    fetchOwnedSkillRefs(),
  ]);

  return filterUserVisibleLibraryItems([...systemItems, ...tenantItems]).map((item) =>
    mapLibrarySkill(item, relation.ownedRefs, relation.shelfByTarget),
  );
}

export async function fetchMySkills(): Promise<AiCenterSkill[]> {
  const shelf = filterUserVisibleShelfEntries(await agentConsoleClient.mySkills());
  const skillShelf = shelf.filter((entry) => entry.targetKind === "skill");
  const refEntries = skillShelf.filter((entry) => entry.source === "ref");
  const authoredEntries = skillShelf.filter((entry) => entry.source === "authored");
  const libraryByRef = refEntries.length > 0 ? await buildLibrarySkillLookup() : new Map<string, LibraryItemView>();

  const authoredSkills = (
    await Promise.all(
      authoredEntries.map(async (entry) => {
        try {
          return mapTenantSkill(await agentConsoleClient.getSkill(entry.targetId), entry);
        } catch {
          return null;
        }
      }),
    )
  ).filter((item): item is AiCenterSkill => item != null);

  return [...authoredSkills, ...refEntries.map((entry) => mapShelfSkill(entry, libraryByRef))];
}

export async function installLibrarySkill(ref: string): Promise<void> {
  await agentConsoleClient.installSkill({ ref });
}

export async function removeMySkill(skill: AiCenterSkill): Promise<void> {
  if (skill.shelfId) {
    await agentConsoleClient.removeShelfSkill(skill.shelfId);
    return;
  }
  const shelf = filterUserVisibleShelfEntries(await agentConsoleClient.mySkills());
  const entry = shelf.find((item) => item.targetKind === "skill" && item.targetId === (skill.libraryRef ?? skill.id));
  if (entry) {
    await agentConsoleClient.removeShelfSkill(entry.id);
  }
}

export async function fetchAssistantSkillOptions(): Promise<SkillItem[]> {
  const skills = await fetchMySkills();
  return skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
  }));
}
