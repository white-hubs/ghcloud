import { listFumigationGrainVarieties, listFumigationWarehouses } from "@ghcloud/cube-services-client/fumigation-operation.client";

import type { WarehouseOption } from "./state";

type FumigationWarehousePayload = {
  warehouseId: string;
  warehouseName: string;
  areaName?: string;
  grainType?: string;
  warehouseCode?: string;
  code?: string;
  capacityTon?: number;
};

interface FumigationGrainVarietyPayload {
  grainVarietyId: string;
  grainVarietyName: string;
  warehouseId?: string;
}

const mapWarehouse = async (item: FumigationWarehousePayload): Promise<WarehouseOption> => {
  const grainName = item.grainType?.trim() || "未维护品种";
  const varieties = (await listFumigationGrainVarieties(item.warehouseId)) as FumigationGrainVarietyPayload[];
  const normalizedVarieties =
    varieties.length === 0
      ? [{ grainVarietyId: `${item.warehouseId}:${grainName}`, grainVarietyName: grainName, warehouseId: item.warehouseId }]
      : varieties;
  return {
    id: item.warehouseId,
    code: item.warehouseCode ?? item.code ?? item.warehouseId,
    name: item.warehouseName,
    capacityTon: item.capacityTon ?? 0,
    source: "intelligent-grain-service",
    grainVarieties: normalizedVarieties.map((variety) => ({
      id: variety.grainVarietyId,
      name: variety.grainVarietyName,
      warehouseId: variety.warehouseId ?? item.warehouseId,
      source: "intelligent-grain-service",
    })),
  };
};

export const loadWarehousesFromIntelligentGrain = async (): Promise<WarehouseOption[]> => {
  try {
    const list = (await listFumigationWarehouses()) as FumigationWarehousePayload[];
    return await Promise.all(list.map((item) => mapWarehouse(item)));
  } catch {
    return [];
  }
};
