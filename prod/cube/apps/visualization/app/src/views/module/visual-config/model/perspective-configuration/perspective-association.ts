import type { BusinessAreaNode } from "@ghcloud/cube-service-interface/mdata";

export type PerspectiveScope = "park" | "area" | "unresolved";

export interface PerspectiveAreaSelection {
  id: string;
  name: string;
  ue5Path: string;
  threePath: string;
  scope: PerspectiveScope;
}

/** 区域树未配置视角标记：叶子红点、父级聚合数量 */
export interface AreaPerspectiveMarker {
  showDot: boolean;
  count: number;
}

export interface Ue5PerspectiveLike {
  id: string;
  areaId?: string;
  area: string;
  camera?: string;
  label?: string;
  [key: string]: unknown;
}

export type PerspectiveAssociationSource = "area-id" | "legacy-id" | "exact-name" | "unresolved" | "ambiguous";

export type PerspectiveAssociation =
  | { source: "area-id" | "legacy-id" | "exact-name"; area: PerspectiveAreaSelection }
  | { source: "unresolved" | "ambiguous" };

export const normalizeAreaPath = (value: string | null | undefined): string =>
  (value ?? "")
    .trim()
    .replaceAll("-", "/")
    .replaceAll(/\s+/gu, "")
    .replaceAll(/^\/+|\/+$/gu, "")
    .toLocaleLowerCase();

const areaNames = (area: PerspectiveAreaSelection): string[] => [area.ue5Path, area.threePath, area.name].map(normalizeAreaPath);

export const classifyUe5Perspective = (
  perspective: Pick<Ue5PerspectiveLike, "id" | "areaId" | "area">,
  areas: readonly PerspectiveAreaSelection[],
): PerspectiveAssociation => {
  if (perspective.areaId) {
    const explicitArea = areas.find((area) => area.id === perspective.areaId);
    return explicitArea ? { source: "area-id", area: explicitArea } : { source: "unresolved" };
  }

  const legacyArea = areas.find((area) => area.id === perspective.id);
  if (legacyArea) {
    return { source: "legacy-id", area: legacyArea };
  }

  const normalizedArea = normalizeAreaPath(perspective.area);
  if (!normalizedArea) {
    return { source: "unresolved" };
  }
  const nameMatches = areas.filter((area) => areaNames(area).includes(normalizedArea));
  if (nameMatches.length > 1) {
    return { source: "ambiguous" };
  }
  return nameMatches[0] ? { source: "exact-name", area: nameMatches[0] } : { source: "unresolved" };
};

/**
 * 统计区域树未配置视角标记。
 * - 叶子：无视角时 showDot
 * - 父级：count 为子树中未配置叶子数量
 * - rootId（如园区）汇总整棵业务区域树
 */
export const buildAreaPerspectiveMarkers = (
  nodes: BusinessAreaNode[],
  configuredAreaIds: ReadonlySet<string>,
  rootId?: string,
): Map<string, AreaPerspectiveMarker> => {
  const map = new Map<string, AreaPerspectiveMarker>();

  const visit = (items: BusinessAreaNode[]): number => {
    let total = 0;
    for (const item of items) {
      const children = item.children ?? [];
      if (children.length === 0) {
        const showDot = !configuredAreaIds.has(item.id);
        map.set(item.id, { showDot, count: 0 });
        if (showDot) {
          total += 1;
        }
        continue;
      }
      const count = visit(children);
      map.set(item.id, { showDot: false, count });
      total += count;
    }
    return total;
  };

  const rootCount = visit(nodes);
  if (rootId) {
    map.set(rootId, { showDot: false, count: rootCount });
  }
  return map;
};
