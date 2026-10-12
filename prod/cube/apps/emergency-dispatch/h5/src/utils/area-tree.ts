import type { AreaTree } from "@ghcloud/cube-mdata-service";

import type { AreaTreeItem, EmergencyEvent } from "./types";

export function mapAreaTreeToTreeItem(area: AreaTree, defaultExpanded = true): AreaTreeItem {
  return {
    id: String(area.id),
    name: area.aliasName || area.name,
    expanded: defaultExpanded,
    children: (area.children ?? []).map((child) => mapAreaTreeToTreeItem(child, defaultExpanded)),
  };
}

export function mapAreaTreesToTreeItems(areas: AreaTree[]): AreaTreeItem[] {
  return areas.map((area) => mapAreaTreeToTreeItem(area));
}

export function findAreaTreeItem(nodes: AreaTreeItem[], id: string): AreaTreeItem | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    const found = findAreaTreeItem(node.children, id);
    if (found) {
      return found;
    }
  }
  return undefined;
}

export function walkAreaTreeItems(nodes: AreaTreeItem[], visit: (node: AreaTreeItem) => void): void {
  nodes.forEach((node) => {
    visit(node);
    walkAreaTreeItems(node.children, visit);
  });
}

export function flattenAreaTreeItems(nodes: AreaTreeItem[]): AreaTreeItem[] {
  const result: AreaTreeItem[] = [];
  walkAreaTreeItems(nodes, (node) => {
    result.push(node);
  });
  return result;
}

export function resolveAreaIdInTree(nodes: AreaTreeItem[], areaId: string | null | undefined): string | null {
  if (!areaId) {
    return null;
  }
  const text = String(areaId).trim();
  if (!text) {
    return null;
  }
  if (findAreaTreeItem(nodes, text)) {
    return text;
  }
  const segments = text
    .split("-")
    .map((part) => part.trim())
    .filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    const candidate = segments[i]!;
    if (findAreaTreeItem(nodes, candidate)) {
      return candidate;
    }
  }
  return null;
}

/** 根据报警区域 id / 名称解析初始区域；无匹配时返回区域树第一项 */
export function resolveInitialAreaId(event: EmergencyEvent, nodes: AreaTreeItem[]): string | null {
  const byId = resolveAreaIdInTree(nodes, event.areaId);
  if (byId) {
    return byId;
  }
  const areaName = event.areaName?.trim();
  if (areaName) {
    const matched = flattenAreaTreeItems(nodes).find((node) => node.name === areaName);
    if (matched) {
      return matched.id;
    }
  }
  return nodes[0]?.id ?? null;
}
