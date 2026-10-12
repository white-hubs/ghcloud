import { listUnitInventoryObjects, pageControlMeasures } from "@ghcloud/cube-services-client/risk-graded-control.client";

import type { ControlMeasureVO, RiskObjectVO } from "@/types/risk";
import { mapMeasureFromApi, mapRiskObjectFromApi, toId, type RiskUnitInventoryApiVO } from "@/utils/risk-control-mapper";
import { loadUnitRiskObjects } from "@/utils/unit-risk-objects";

export function resolveInventoryUnitId(vo: RiskUnitInventoryApiVO): string {
  return toId(vo.unitId ?? vo.id);
}

export async function loadUnitInventoryDetail(
  unitId: string,
  request: <T>(fn: () => T) => T,
): Promise<{ objects: RiskObjectVO[]; measures: ControlMeasureVO[] }> {
  let objects: RiskObjectVO[] = [];
  try {
    const detail = await request(() => listUnitInventoryObjects(unitId, { pageNumber: 1, pageSize: 500 }));
    objects = (detail.objects ?? detail.records ?? []).map(mapRiskObjectFromApi);
  } catch {
    // fallback below
  }
  if (!objects.length) {
    objects = await loadUnitRiskObjects(unitId, request);
  }

  let measures: ControlMeasureVO[] = [];
  try {
    const page = await request(() => pageControlMeasures({ unitId, pageNumber: 1, pageSize: 500 }));
    measures = (page.records ?? page.measures ?? []).map(mapMeasureFromApi);
  } catch {
    // keep empty
  }

  return { objects, measures };
}
