import { BASE_API } from "@ghcloud/cube-protocol";

import { parseLocationCardInfoResponse } from "./location-card-parse";
import type { LocationCardInfo } from "./location-card-types";

const LOCATION_CARD_INFO_URL = `${BASE_API}/changsha-xialing/liangcang/warehouse-management/location-card/info`;
const WAREHOUSE_CORRESPONDING_ID = "WAREHOUSE_CORRESPONDING_ID";
const WAREHOUSE_CORRESPONDING_ID_URL = `${BASE_API}/dictionary/getSysDictionaryByCodeAndItemCode`;

interface WarehouseCorrespondingId {
  label: string;
  id: string;
}

export interface WarehouseTemperatureBoardIdentity {
  warehouseLabel: string | null;
}

const removeJsonTrailingCommas = (raw: string): string => {
  let result = "";
  let inString = false;
  let escaping = false;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (inString) {
      result += char;
      if (escaping) {
        escaping = false;
      } else if (char === "\\") {
        escaping = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
      result += char;
      continue;
    }
    if (char === ",") {
      let nextIndex = index + 1;
      while (nextIndex < raw.length && /\s/.test(raw[nextIndex])) {
        nextIndex += 1;
      }
      if (raw[nextIndex] === "}" || raw[nextIndex] === "]") {
        continue;
      }
    }
    result += char;
  }
  return result;
};

const parseWarehouseCorrespondingIds = (raw: unknown): WarehouseCorrespondingId[] => {
  if (typeof raw === "string") {
    try {
      return parseWarehouseCorrespondingIds(JSON.parse(raw) as unknown);
    } catch {
      try {
        return parseWarehouseCorrespondingIds(JSON.parse(removeJsonTrailingCommas(raw)) as unknown);
      } catch {
        return [];
      }
    }
  }
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => parseWarehouseCorrespondingIds(item));
  }
  if (raw == null || typeof raw !== "object") {
    return [];
  }
  const row = raw as Record<string, unknown>;
  if (typeof row.label === "string" && (typeof row.id === "string" || typeof row.id === "number")) {
    return [{ label: row.label, id: String(row.id) }];
  }
  return Object.values(row).flatMap((value) => parseWarehouseCorrespondingIds(value));
};

export const getWarehouseLocationCardInfo = async (warehouseId: number): Promise<LocationCardInfo | null> => {
  const url = new URL(LOCATION_CARD_INFO_URL, window.location.origin);
  url.searchParams.set("warehouseId", String(warehouseId));
  const resp = await fetch(url.toString());
  if (!resp.ok) {
    throw new Error(`Location card info request failed: ${resp.status}`);
  }
  return parseLocationCardInfoResponse(await resp.json());
};

export const getWarehouseTemperatureBoardIdentity = async (warehouseId: number): Promise<WarehouseTemperatureBoardIdentity> => {
  const url = new URL(WAREHOUSE_CORRESPONDING_ID_URL, window.location.origin);
  url.searchParams.set("itemCode", WAREHOUSE_CORRESPONDING_ID);
  url.searchParams.set("code", WAREHOUSE_CORRESPONDING_ID);
  const resp = await fetch(url.toString());
  if (!resp.ok) {
    throw new Error(`Warehouse corresponding dictionary request failed: ${resp.status}`);
  }
  const matched = parseWarehouseCorrespondingIds(await resp.json()).find((item) => item.id === String(warehouseId));
  return {
    warehouseLabel: matched?.label.trim() ?? null,
  };
};
