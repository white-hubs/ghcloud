export type FloorNode = {
  name?: string;
  aliasName?: string;
  actorId?: string;
  selected?: boolean;
  [key: string]: unknown;
};

const FLOOR_ALIASES: Record<string, string[]> = {
  顶层: ["顶", "屋顶", "屋面", "天台", "顶楼", "最高"],
  顶楼: ["顶", "屋顶", "屋面", "天台", "顶层", "最高"],
  底层: ["底", "一楼", "1楼", "1f", "地面", "首层"],
  一楼: ["1楼", "1f", "一层", "首层", "地面"],
  二楼: ["2楼", "2f", "二层"],
  三楼: ["3楼", "3f", "三层"],
  四楼: ["4楼", "4f", "四层"],
  五楼: ["5楼", "5f", "五层"],
  六楼: ["6楼", "6f", "六层"],
  七楼: ["7楼", "7f", "七层"],
  八楼: ["8楼", "8f", "八层"],
  九楼: ["9楼", "9f", "九层"],
  十楼: ["10楼", "10f", "十层"],
  地下室: ["地下", "负一", "b1", "-1"],
};

function normalizeFloorQuery(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, "");
}

function floorMatchScore(floorName: string, query: string): number {
  const name = normalizeFloorQuery(floorName);
  const q = normalizeFloorQuery(query);
  if (!name || !q) {
    return 0;
  }
  if (name === q) {
    return 100;
  }
  if (name.includes(q) || q.includes(name)) {
    return 80;
  }
  const aliases = FLOOR_ALIASES[q] ?? [];
  for (const alias of aliases) {
    if (name.includes(alias) || alias.includes(name)) {
      return 70;
    }
  }
  if (q === "顶层" || q === "顶楼" || q === "最高层") {
    if (/顶|屋面|屋顶|天台|rf|roof/.test(name)) {
      return 75;
    }
  }
  const qNum = q.match(/(\d+)/)?.[1];
  const nameNum = name.match(/(\d+)/)?.[1];
  if (qNum && nameNum && qNum === nameNum) {
    return 60;
  }
  return 0;
}

export function resolveFloorPerspective(floors: readonly FloorNode[] | undefined | null, raw: unknown): FloorNode | undefined {
  if (!Array.isArray(floors) || floors.length === 0 || raw == null) {
    return undefined;
  }
  const query = String(raw).trim();
  if (!query) {
    return undefined;
  }

  let best: FloorNode | undefined;
  let bestScore = 0;
  for (const floor of floors) {
    const score = Math.max(floorMatchScore(floor.name ?? "", query), floorMatchScore(floor.aliasName ?? "", query));
    if (score > bestScore) {
      bestScore = score;
      best = floor;
    }
  }
  if (best) {
    return best;
  }

  const q = normalizeFloorQuery(query);
  if (q === "顶层" || q === "顶楼" || q === "最高层" || q === "屋顶") {
    return floors[floors.length - 1];
  }
  if (q === "底层" || q === "首层" || q === "地面层") {
    return floors[0];
  }
  return undefined;
}

export function extractBuildingHint(params: Record<string, unknown> | undefined | null): string {
  if (!params) {
    return "";
  }
  for (const key of ["building", "buildingName", "building_name", "area", "areaName", "value"]) {
    const v = params[key];
    if (typeof v === "string" && v.trim()) {
      return v.trim();
    }
  }
  return "";
}

export function extractFloorHint(params: Record<string, unknown> | undefined | null): string {
  if (!params) {
    return "";
  }
  for (const key of ["floor", "floorName", "floor_name", "level", "levelName", "storey"]) {
    const v = params[key];
    if (typeof v === "string" || typeof v === "number") {
      const text = String(v).trim();
      if (text) {
        return text;
      }
    }
  }
  return "";
}
