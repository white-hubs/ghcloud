import type { LibraryItemView } from "@cube-ai/contracts";

/**
 * 与 @cube-ai/contracts descriptor/engine-internal-catalog 对齐。
 * contracts 旧 dist 可能尚未包含这些导出，先在业务侧保持和 PC 端一致的过滤规则。
 */
const ENGINE_INTERNAL_AGENT_REFS = ["cube-default", "cube-descriptor-manager", "cube-researcher"] as const;
const ENGINE_INTERNAL_SKILL_REFS = ["default-reasoning", "chart-output"] as const;

const INTERNAL_AGENT_SET = new Set<string>(ENGINE_INTERNAL_AGENT_REFS);
const INTERNAL_SKILL_SET = new Set<string>(ENGINE_INTERNAL_SKILL_REFS);

function isEngineInternalAgentRef(ref: string): boolean {
  return INTERNAL_AGENT_SET.has(ref);
}

function isEngineInternalSkillRef(ref: string): boolean {
  return INTERNAL_SKILL_SET.has(ref);
}

function isEngineInternalLibraryRef(kind: LibraryItemView["kind"], ref: string): boolean {
  return kind === "agent" ? isEngineInternalAgentRef(ref) : isEngineInternalSkillRef(ref);
}

export { isEngineInternalLibraryRef };

export function filterUserVisibleLibraryItems<T extends Pick<LibraryItemView, "kind" | "ref">>(items: T[]): T[] {
  return items.filter((item) => !isEngineInternalLibraryRef(item.kind, item.ref));
}

export interface UserShelfLike {
  targetKind: "agent" | "skill";
  targetId: string;
}

export function filterUserVisibleShelfEntries<T extends UserShelfLike>(entries: T[]): T[] {
  return entries.filter((entry) => !isEngineInternalLibraryRef(entry.targetKind, entry.targetId));
}
