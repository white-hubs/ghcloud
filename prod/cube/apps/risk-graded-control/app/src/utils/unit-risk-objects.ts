import { getUnit, pageRiskObjects } from "@ghcloud/cube-services-client/risk-graded-control.client";

import type { RiskObjectVO } from "@/types/risk";
import { mapRiskObjectFromApi } from "@/utils/risk-control-mapper";

/** 按单元 ID 加载风险对象（优先 getUnit.objects，否则 pageRiskObjects） */
export async function loadUnitRiskObjects(unitId: string, request: <T>(fn: () => T) => T): Promise<RiskObjectVO[]> {
  const unitVo = await request(() => getUnit(unitId));
  const fromUnit = (unitVo.objects ?? []).map(mapRiskObjectFromApi);
  if (fromUnit.length > 0) return fromUnit;

  const page = await request(() =>
    pageRiskObjects({
      unitId,
      pageNumber: 1,
      pageSize: 500,
    }),
  );
  return page.records.map(mapRiskObjectFromApi);
}
