import { pageAreas, pageUnitTypes } from "@ghcloud/cube-services-client/risk-graded-control.client";

import type { IdentificationUnitVO, UnitVO } from "@/types/risk";
import { userDisplayName, usersDisplayNames, type RiskIdentificationUnitApiVO, type RiskUnitApiVO } from "@/utils/risk-control-mapper";

export type OptionNameMap = ReadonlyMap<string, string>;

export async function loadAreaAndUnitTypeNameMaps(
  request: <T>(fn: () => Promise<T>) => Promise<T>,
): Promise<{ areaNames: OptionNameMap; unitTypeNames: OptionNameMap }> {
  const [areasPage, typesPage] = await Promise.all([
    request(() => pageAreas({ pageNumber: 1, pageSize: 500, view: "option" })).catch(() => ({ records: [] })),
    request(() => pageUnitTypes({ pageNumber: 1, pageSize: 500, view: "option" })).catch(() => ({ records: [] })),
  ]);
  const areaNames = new Map<string, string>();
  const unitTypeNames = new Map<string, string>();
  areasPage.records.forEach((item) => {
    const id = String(item.id ?? "").trim();
    const name = String(item.name ?? "").trim();
    if (id && name) areaNames.set(id, name);
  });
  typesPage.records.forEach((item) => {
    const id = String(item.id ?? "").trim();
    const name = String(item.name ?? "").trim();
    if (id && name) unitTypeNames.set(id, name);
  });
  return { areaNames, unitTypeNames };
}

function resolveZoneName(vo: RiskUnitApiVO, areaNames?: OptionNameMap): string {
  const fromOption = optionDisplayName(vo.area);
  if (fromOption) return fromOption;
  const areaId = String(vo.areaId ?? vo.area?.id ?? "").trim();
  const fromMap = areaId ? areaNames?.get(areaId) : undefined;
  if (fromMap) return fromMap;
  return String(vo.locationDesc ?? "").trim();
}

function resolveUnitType(vo: RiskUnitApiVO, unitTypeNames?: OptionNameMap): string {
  const fromOption = optionDisplayName(vo.unitType, vo.type);
  if (fromOption) return fromOption;
  const typeId = String(vo.unitTypeId ?? vo.unitType?.id ?? "").trim();
  const fromMap = typeId ? unitTypeNames?.get(typeId) : undefined;
  if (fromMap) return fromMap;
  return "";
}

export function enrichUnitVoFromApi(
  vo: RiskUnitApiVO,
  unit: UnitVO,
  maps?: { areaNames?: OptionNameMap; unitTypeNames?: OptionNameMap },
): UnitVO {
  const identifyUsers = unit.identifyUsers.length ? unit.identifyUsers : usersDisplayNames(vo.identifierUsers, vo.identifierUserIds);
  return {
    ...unit,
    unitType: unit.unitType || resolveUnitType(vo, maps?.unitTypeNames) || "--",
    zoneName: unit.zoneName || resolveZoneName(vo, maps?.areaNames) || "--",
    identifyUsers: identifyUsers.length ? identifyUsers : ["--"],
    responsibleUser: unit.responsibleUser || userDisplayName(vo.responsibleUser, unit.responsibleUserId) || "--",
  };
}

export function enrichIdentificationUnitFromApi(
  vo: RiskIdentificationUnitApiVO,
  item: IdentificationUnitVO,
  maps?: { areaNames?: OptionNameMap; unitTypeNames?: OptionNameMap },
): IdentificationUnitVO {
  const identifyUsers = item.identifyUsers.length ? item.identifyUsers : usersDisplayNames(vo.identifierUsers, vo.identifierUserIds);
  return {
    ...item,
    unitType: item.unitType || resolveUnitType(vo, maps?.unitTypeNames) || "--",
    zoneName: item.zoneName || resolveZoneName(vo, maps?.areaNames) || "--",
    identifyUsers: identifyUsers.length ? identifyUsers : ["--"],
  };
}
