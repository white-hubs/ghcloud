type AreaTreeInput = {
  id: string | number;
  name: string;
  nodeType?: string;
  floorId?: string;
  floorPlanFileId?: string;
  children?: AreaTreeInput[] | null;
};

export interface SystemAreaNode {
  key: string;
  title: string;
  path: string;
  nodeType?: string;
  floorId?: string;
  floorPlanFileId?: string;
  ancestorIds: string[];
  children: SystemAreaNode[];
}

/** 保留定位区域的 ID、顺序与完整层级。 */
export function buildSystemAreaTree(areas: AreaTreeInput[]): {
  tree: SystemAreaNode[];
  byId: Map<string, SystemAreaNode>;
} {
  const byId = new Map<string, SystemAreaNode>();
  function visit(items: AreaTreeInput[], ancestors: SystemAreaNode[]): SystemAreaNode[] {
    return items.map((area) => {
      const node: SystemAreaNode = {
        key: String(area.id),
        title: area.name,
        path: [...ancestors.map((parent) => parent.title), area.name].join(" / "),
        ...(area.nodeType ? { nodeType: area.nodeType } : {}),
        ...(area.floorId ? { floorId: String(area.floorId) } : {}),
        ...(area.floorPlanFileId ? { floorPlanFileId: area.floorPlanFileId } : {}),
        ancestorIds: ancestors.map((parent) => parent.key),
        children: [],
      };
      byId.set(node.key, node);
      node.children = visit(area.children ?? [], [...ancestors, node]);
      return node;
    });
  }
  return { tree: visit(areas, []), byId };
}

/** 定位楼层可能同时关联场景、楼栋和楼层节点；优先选择有平面图的匹配区域。 */
export function areaForFloor(
  byId: ReadonlyMap<string, SystemAreaNode>,
  floorId: string,
  preferredAreaId?: string,
): SystemAreaNode | undefined {
  const matches = [...byId.values()].filter((node) => node.floorId === floorId);
  const preferred = preferredAreaId ? byId.get(preferredAreaId) : undefined;
  const validPreferred = preferred?.floorId === floorId ? preferred : undefined;
  return (validPreferred?.floorPlanFileId ? validPreferred : matches.find((node) => node.floorPlanFileId)) ?? validPreferred ?? matches[0];
}

/** 保留命中节点的祖先路径；命中父级时保留其下级，便于继续选择区域。 */
export function filterSystemAreaTree(
  tree: SystemAreaNode[],
  keyword: string,
): {
  tree: SystemAreaNode[];
  expandedKeys: string[];
  matchCount: number;
} {
  const query = keyword.trim().toLowerCase();
  if (!query) {
    return { tree, expandedKeys: [], matchCount: 0 };
  }
  const expandedKeys = new Set<string>();
  let matchCount = 0;
  function visit(nodes: SystemAreaNode[]): SystemAreaNode[] {
    return nodes.flatMap((node) => {
      const children = visit(node.children);
      if (node.title.toLowerCase().includes(query)) {
        matchCount += 1;
        node.ancestorIds.forEach((id) => expandedKeys.add(id));
        if (node.children.length > 0) {
          expandedKeys.add(node.key);
        }
        return [node];
      }
      return children.length > 0 ? [{ ...node, children }] : [];
    });
  }
  const filteredTree = visit(tree);
  return { tree: filteredTree, expandedKeys: [...expandedKeys], matchCount };
}
