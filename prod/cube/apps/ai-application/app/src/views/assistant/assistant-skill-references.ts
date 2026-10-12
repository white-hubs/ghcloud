import type { LibraryItemView, ShelfEntryView } from "@cube-ai/contracts";

import { agentConsoleClient } from "../../api/agent-console-client";
import {
  filterUserVisibleLibraryItems,
  filterUserVisibleShelfEntries,
  isEngineInternalLibraryRef,
} from "../../utils/engine-internal-catalog";
import { resolveShelfSkillDisplayName } from "../skill-management/skill-shelf-display-name";
import type { AssistantComposerReference } from "./assistant-chat-ui";

/**
 * 聊天 @ 引用：仅需技能的 id + 名称即可透传给引擎。
 *
 * 货架 displayName 对库安装系统技能常为 code；优先用技能库 browse 的中文名，
 * 再回退系统档案 / 静态兜底表。
 */
export function buildAssistantSkillReferencesFromShelf(
  skillShelf: ShelfEntryView[],
  libraryByRef?: Map<string, Pick<LibraryItemView, "displayName" | "tier">>,
): AssistantComposerReference[] {
  const references: AssistantComposerReference[] = [];
  const existingIds = new Set<string>();

  for (const entry of skillShelf) {
    if (entry.targetKind !== "skill" || entry.runnableStatus !== "runnable") {
      continue;
    }
    if (isEngineInternalLibraryRef("skill", entry.targetId)) {
      continue;
    }
    if (existingIds.has(entry.targetId)) {
      continue;
    }
    references.push({
      type: "skill",
      id: entry.targetId,
      label: resolveShelfSkillDisplayName(entry, libraryByRef?.get(entry.targetId)),
      description: entry.source === "ref" ? "技能库" : "我的技能",
    });
    existingIds.add(entry.targetId);
  }

  return references;
}

async function fetchLibrarySkillDisplayLookup(): Promise<Map<string, Pick<LibraryItemView, "displayName" | "tier">>> {
  const map = new Map<string, Pick<LibraryItemView, "displayName" | "tier">>();
  for (const tier of ["system", "tenant"] as const) {
    try {
      const items = filterUserVisibleLibraryItems(await agentConsoleClient.browseLibrarySkills({ tier }));
      for (const item of items) {
        map.set(item.ref, { displayName: item.displayName, tier: item.tier });
      }
    } catch {
      /* 单 tier 失败不阻塞 */
    }
  }
  return map;
}

/** 聊天 @ 引用：仅展示「我的技能」货架（自研 + 库安装）；库安装技能补齐技能库中文名。 */
export async function fetchAssistantSkillReferences(): Promise<AssistantComposerReference[]> {
  const shelf = filterUserVisibleShelfEntries(await agentConsoleClient.mySkills());
  const skillShelf = shelf.filter((entry) => entry.targetKind === "skill");
  const needsLibraryLookup = skillShelf.some((entry) => entry.source === "ref");
  const libraryByRef = needsLibraryLookup ? await fetchLibrarySkillDisplayLookup() : undefined;
  return buildAssistantSkillReferencesFromShelf(skillShelf, libraryByRef);
}
