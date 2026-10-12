export type AreaNode = {
  id?: string;
  name?: string;
  aliasName?: string;
  children?: AreaNode[];
  [key: string]: unknown;
};

function normalizeAreaQuery(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/(的)?(视角|楼栋|建筑|区域)$/g, "");
}

export function flattenAreaNodes(roots: readonly AreaNode[] | undefined | null): AreaNode[] {
  if (!Array.isArray(roots) || roots.length === 0) {
    return [];
  }
  const out: AreaNode[] = [];
  const walk = (nodes: readonly AreaNode[]): void => {
    for (const node of nodes) {
      if (!node) {
        continue;
      }
      out.push(node);
      if (Array.isArray(node.children) && node.children.length > 0) {
        walk(node.children);
      }
    }
  };
  walk(roots);
  return out;
}

export function resolveAreaPerspective(roots: readonly AreaNode[] | undefined | null, raw: unknown): AreaNode | undefined {
  if (raw == null) {
    return undefined;
  }
  const query = String(raw).trim();
  if (!query) {
    return undefined;
  }
  const list = flattenAreaNodes(roots);
  if (list.length === 0) {
    return undefined;
  }

  const exact = list.find((item) => item.name === query || item.aliasName === query);
  if (exact) {
    return exact;
  }

  const includesHit = list.find((item) => {
    const name = item.name ?? "";
    const alias = item.aliasName ?? "";
    return (
      (name.length > 0 && (name.includes(query) || query.includes(name))) ||
      (alias.length > 0 && (alias.includes(query) || query.includes(alias)))
    );
  });
  if (includesHit) {
    return includesHit;
  }

  const qNorm = normalizeAreaQuery(query);
  if (!qNorm) {
    return undefined;
  }

  return list.find((item) => {
    const nameNorm = normalizeAreaQuery(item.name ?? "");
    const aliasNorm = normalizeAreaQuery(item.aliasName ?? "");
    return (
      (nameNorm.length > 0 && (nameNorm === qNorm || nameNorm.includes(qNorm) || qNorm.includes(nameNorm))) ||
      (aliasNorm.length > 0 && (aliasNorm === qNorm || aliasNorm.includes(qNorm) || qNorm.includes(aliasNorm)))
    );
  });
}
