import { SCENE_SCOPE_KIND_LABELS, SCENE_SCOPE_KINDS, resolvePageSceneScope, type SceneScopeKind } from "@cube-scada/core";

export type SceneScopeFilter = SceneScopeKind | "all";

export const SCENE_SCOPE_FILTER_OPTIONS: Array<{ value: SceneScopeFilter; label: string }> = [
  { value: "all", label: "全部" },
  ...SCENE_SCOPE_KINDS.map((value) => ({ value, label: SCENE_SCOPE_KIND_LABELS[value] })),
];

export const SCENE_SCOPE_TAG_COLOR: Record<SceneScopeKind, string> = {
  singleDevice: "green",
  multiDevice: "blue",
};

export function sceneScopeLabel(scope: SceneScopeKind): string {
  return SCENE_SCOPE_KIND_LABELS[scope];
}

export function firstPageIdForSceneScopeFilter(
  pages: ReadonlyArray<{ id: string; sceneScope: SceneScopeKind }>,
  filter: SceneScopeFilter,
): string {
  return pages.find((page) => filter === "all" || page.sceneScope === filter)?.id ?? "";
}

export function parseSceneScopeFromPageContent(content: string | undefined | null): SceneScopeKind {
  if (!content) {
    return "singleDevice";
  }
  try {
    const parsed = JSON.parse(content) as {
      sceneScope?: unknown;
      elements?: Array<{ deviceBinding?: unknown }>;
    };
    return resolvePageSceneScope(parsed);
  } catch {
    return "singleDevice";
  }
}
