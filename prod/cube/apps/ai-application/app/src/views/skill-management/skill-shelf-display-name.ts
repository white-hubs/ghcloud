import type { LibraryItemView, ShelfEntryView } from "@cube-ai/contracts";

import { resolveSystemBuiltinSkillContent } from "./system-skill-profiles";

/**
 * 系统技能在货架上常只带回 code；前端档案未覆盖的条目用此表兜底中文名。
 * 与 descriptors/skills 下各 SKILL.md 的 displayName 对齐。
 */
const SYSTEM_SKILL_DISPLAY_NAME_FALLBACKS: Record<string, string> = {
  "default-reasoning": "默认推理",
  "chart-output": "图表输出",
  "html-output": "报告输出",
  "model-interact": "模型交互",
};

/**
 * 货架 ref 的 displayName 常为技能 code（如 model-interact），
 * 技能库 browse / 系统档案才是中文展示名。优先库与系统档案。
 */
export function resolveShelfSkillDisplayName(
  entry: Pick<ShelfEntryView, "targetId" | "displayName">,
  libraryItem?: Pick<LibraryItemView, "displayName" | "tier"> | null,
): string {
  const libraryName = libraryItem?.displayName?.trim();
  if (libraryName) {
    return libraryName;
  }
  const systemName = resolveSystemBuiltinSkillContent(entry.targetId)?.displayName?.trim();
  if (systemName) {
    return systemName;
  }
  const fallbackName = SYSTEM_SKILL_DISPLAY_NAME_FALLBACKS[entry.targetId]?.trim();
  if (fallbackName) {
    return fallbackName;
  }
  const shelfName = entry.displayName?.trim();
  if (shelfName && shelfName !== entry.targetId) {
    return shelfName;
  }
  return shelfName || entry.targetId;
}

export function resolveShelfSkillDescription(
  entry: Pick<ShelfEntryView, "targetId">,
  libraryItem?: Pick<LibraryItemView, "description"> | null,
): string {
  const libraryDescription = libraryItem?.description?.trim();
  if (libraryDescription) {
    return libraryDescription;
  }
  return resolveSystemBuiltinSkillContent(entry.targetId)?.description?.trim() || "";
}
