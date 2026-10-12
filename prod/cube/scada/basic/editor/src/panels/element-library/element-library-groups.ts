import type { ElementDef } from "@cube-scada/core";

export const ALL_ELEMENT_GROUPS = "__all__";

export type ElementGroups = Record<string, ElementDef[]>;

export function groupElements(elements: ElementDef[], getGroup: (element: ElementDef) => string): ElementGroups {
  const groups: ElementGroups = {};
  for (const element of elements) {
    const group = getGroup(element).trim() || "未分组";
    (groups[group] ??= []).push(element);
  }

  return Object.fromEntries(
    Object.entries(groups)
      .sort(([left], [right]) => left.localeCompare(right, "zh-CN"))
      .map(([group, items]) => [group, [...items].sort((left, right) => left.label.localeCompare(right.label, "zh-CN"))]),
  );
}

export function selectElementGroup(groups: ElementGroups, selectedGroup: string): ElementGroups {
  if (selectedGroup === ALL_ELEMENT_GROUPS) {
    return groups;
  }
  const elements = groups[selectedGroup];
  return elements ? { [selectedGroup]: elements } : {};
}

export function retainElementGroupSelection(selectedGroup: string, availableGroups: readonly string[]): string {
  if (selectedGroup === ALL_ELEMENT_GROUPS || availableGroups.includes(selectedGroup)) {
    return selectedGroup;
  }
  return ALL_ELEMENT_GROUPS;
}

export function followRenamedElementGroup(selectedGroup: string, sourceGroup: string, targetGroup: string): string {
  return selectedGroup === sourceGroup ? targetGroup : selectedGroup;
}

export function filterGroups(groups: ElementGroups, searchText: string): ElementGroups {
  const search = searchText.trim().toLowerCase();
  if (!search) return groups;

  const result: ElementGroups = {};
  for (const [group, elements] of Object.entries(groups)) {
    const groupMatches = group.toLowerCase().includes(search);
    const matchedElements = groupMatches
      ? elements
      : elements.filter((element) => element.label.toLowerCase().includes(search) || element.type.toLowerCase().includes(search));
    if (matchedElements.length > 0) result[group] = matchedElements;
  }
  return result;
}

export function mergeOpenGroups(current: string[], nextKeys: string[], previousKeys: string[]): string[] {
  const retained = current.filter((key) => nextKeys.includes(key));
  const added = nextKeys.filter((key) => !previousKeys.includes(key));
  return Array.from(new Set([...retained, ...added]));
}
