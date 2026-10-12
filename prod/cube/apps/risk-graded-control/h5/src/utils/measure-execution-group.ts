import type { UploaderFileListItem } from "vant";

import { RISK_BORDER_COLOR } from "@/constants";
import type { ControlMeasureVO, RiskLevel } from "@/types/risk";
import {
  mapMeasureFromApi,
  mapRiskLevelFromApi,
  resolveControlMeasureUnitName,
  type RiskControlMeasureApiVO,
} from "@/utils/risk-control-mapper";

const LEVEL_ORDER: Record<RiskLevel, number> = {
  MAJOR: 4,
  SIGNIFICANT: 3,
  GENERAL: 2,
  LOW: 1,
};

export interface MeasureExecutionItem extends ControlMeasureVO {
  unitName: string;
  objectName: string;
  riskLevel?: RiskLevel;
  execRemark: string;
  fileIds: string[];
  attachments: Array<{ id: string; path: string; name: string }>;
  fileVOS: UploaderFileListItem[];
}

export interface UnitMeasureGroup {
  unitId: string;
  unitName: string;
  riskLevel: RiskLevel;
  borderColor: string;
  measures: MeasureExecutionItem[];
}

export const MEASURE_EXEC_STATUS = {
  PENDING: { label: "待执行", tagType: "warning" as const },
  EXECUTING: { label: "执行中", tagType: "primary" as const },
  DONE: { label: "已执行", tagType: "success" as const },
  OVERDUE: { label: "超期", tagType: "danger" as const },
} satisfies Record<ControlMeasureVO["execStatus"], { label: string; tagType: "default" | "primary" | "success" | "warning" | "danger" }>;

function resolveUnitId(raw: RiskControlMeasureApiVO, measure: ControlMeasureVO, fallback: number): string {
  return measure.unitId || String(raw.unit?.id ?? raw.unitId ?? fallback);
}

export function buildUnitMeasureGroupsFromApi(
  rawRecords: RiskControlMeasureApiVO[],
  unitNameById?: ReadonlyMap<string, string>,
): UnitMeasureGroup[] {
  const grouped = new Map<string, MeasureExecutionItem[]>();
  const unitNames = new Map<string, string>();

  rawRecords.forEach((raw, idx) => {
    const measure = mapMeasureFromApi(raw);
    if (measure.execStatus === "DONE") return;

    const riskLevel = mapRiskLevelFromApi(raw.controlRiskLevel ?? raw.inherentRiskLevel);
    const unitId = resolveUnitId(raw, measure, idx);
    const unitName = resolveControlMeasureUnitName(raw, unitId, unitNameById);
    unitNames.set(unitId, unitName);

    const item: MeasureExecutionItem = {
      ...measure,
      unitName,
      objectName: raw.objectName ?? measure.objectId,
      riskLevel,
      execRemark: "",
      fileIds: [],
      attachments: [],
      fileVOS: [],
    };
    const list = grouped.get(unitId) ?? [];
    list.push(item);
    grouped.set(unitId, list);
  });

  return [...grouped.entries()]
    .map(([unitId, measures]) => {
      const riskLevel = measures.reduce<RiskLevel>((max, m) => {
        if (!m.riskLevel) return max;
        return LEVEL_ORDER[m.riskLevel] > LEVEL_ORDER[max] ? m.riskLevel : max;
      }, "LOW");
      return {
        unitId,
        unitName: unitNames.get(unitId) ?? unitId,
        riskLevel,
        borderColor: RISK_BORDER_COLOR[riskLevel],
        measures: measures.sort((a, b) => LEVEL_ORDER[b.riskLevel ?? "LOW"] - LEVEL_ORDER[a.riskLevel ?? "LOW"]),
      };
    })
    .sort((a, b) => LEVEL_ORDER[b.riskLevel] - LEVEL_ORDER[a.riskLevel]);
}

export function computeExecutionStats(groups: UnitMeasureGroup[]): { pending: number } {
  let pending = 0;
  groups.forEach((g) => {
    pending += g.measures.length;
  });
  return { pending };
}

export function buildUnitFilterOptions(groups: UnitMeasureGroup[]): Array<{ text: string; value: string }> {
  return [{ text: "全部风险单元", value: "" }, ...groups.map((g) => ({ text: g.unitName, value: g.unitId }))];
}

export function updateMeasureInGroups(
  groups: UnitMeasureGroup[],
  unitId: string,
  measureId: string,
  patch: Partial<Pick<MeasureExecutionItem, "execRemark" | "fileIds" | "attachments" | "fileVOS">>,
): UnitMeasureGroup[] {
  return groups.map((g) => {
    if (g.unitId !== unitId) return g;
    return {
      ...g,
      measures: g.measures.map((m) => (m.id === measureId ? { ...m, ...patch } : m)),
    };
  });
}

export function removeMeasureFromGroups(groups: UnitMeasureGroup[], unitId: string, measureId: string): UnitMeasureGroup[] {
  return groups
    .map((g) => {
      if (g.unitId !== unitId) return g;
      return { ...g, measures: g.measures.filter((m) => m.id !== measureId) };
    })
    .filter((g) => g.measures.length > 0);
}
