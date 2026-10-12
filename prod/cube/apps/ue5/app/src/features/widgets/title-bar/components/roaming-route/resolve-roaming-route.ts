export type RoamingRouteItem = {
  id?: string;
  name: string;
  route?: unknown;
};

function normalizeRoamName(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/(路线|漫游路线|漫游)$/g, "");
}

export function resolveRoamingRoute(routes: readonly RoamingRouteItem[], raw: unknown): RoamingRouteItem | undefined {
  if (!Array.isArray(routes) || routes.length === 0 || raw == null) {
    return undefined;
  }
  const query = String(raw).trim();
  if (!query) {
    return undefined;
  }

  const exact = routes.find((r) => r.name === query);
  if (exact) {
    return exact;
  }

  const includesHit = routes.find((r) => r.name.includes(query) || query.includes(r.name));
  if (includesHit) {
    return includesHit;
  }

  const qNorm = normalizeRoamName(query);
  if (!qNorm) {
    return undefined;
  }

  return routes.find((r) => {
    const n = normalizeRoamName(r.name);
    return n === qNorm || n.includes(qNorm) || qNorm.includes(n);
  });
}
