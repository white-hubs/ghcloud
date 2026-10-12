import {
  classifyUe5Perspective,
  type PerspectiveAreaSelection,
  type PerspectiveAssociationSource,
  type Ue5PerspectiveLike,
} from "./perspective-association";

export type PerspectiveMigrationReason = "fill-area-id" | "rename-area" | "fill-and-rename";

export interface PerspectiveMigrationChange {
  sourceIndex: number;
  source: Exclude<PerspectiveAssociationSource, "unresolved" | "ambiguous">;
  areaId: string;
  fromArea: string;
  toArea: string;
  fromAreaId?: string;
  nameUnchanged: boolean;
  reason: PerspectiveMigrationReason;
}

export interface PerspectiveMigrationReport {
  total: number;
  current: number;
  upgradeable: number;
  unresolved: number;
  ambiguous: number;
  changes: PerspectiveMigrationChange[];
}

export const MIGRATION_REASON_LABEL: Record<PerspectiveMigrationReason, string> = {
  "fill-area-id": "补齐区域 ID",
  "rename-area": "更新区域名称",
  "fill-and-rename": "绑定区域并更新名称",
};

const resolveMigrationReason = (
  perspective: Ue5PerspectiveLike,
  areaId: string,
  toArea: string,
): { nameUnchanged: boolean; reason: PerspectiveMigrationReason } => {
  const nameUnchanged = (perspective.area || "") === toArea;
  const idChanged = perspective.areaId !== areaId;
  if (nameUnchanged && idChanged) {
    return { nameUnchanged, reason: "fill-area-id" };
  }
  if (!nameUnchanged && idChanged) {
    return { nameUnchanged, reason: "fill-and-rename" };
  }
  return { nameUnchanged, reason: "rename-area" };
};

export const createPerspectiveMigrationReport = (
  perspectives: readonly Ue5PerspectiveLike[],
  areas: readonly PerspectiveAreaSelection[],
): PerspectiveMigrationReport => {
  const report: PerspectiveMigrationReport = {
    total: perspectives.length,
    current: 0,
    upgradeable: 0,
    unresolved: 0,
    ambiguous: 0,
    changes: [],
  };

  perspectives.forEach((perspective, sourceIndex) => {
    const association = classifyUe5Perspective(perspective, areas);
    if (association.source === "unresolved" || association.source === "ambiguous") {
      report[association.source] += 1;
      return;
    }

    const needsUpgrade = perspective.areaId !== association.area.id || perspective.area !== association.area.ue5Path;
    if (!needsUpgrade) {
      report.current += 1;
      return;
    }
    const { nameUnchanged, reason } = resolveMigrationReason(perspective, association.area.id, association.area.ue5Path);
    report.upgradeable += 1;
    report.changes.push({
      sourceIndex,
      source: association.source,
      areaId: association.area.id,
      fromArea: perspective.area,
      toArea: association.area.ue5Path,
      fromAreaId: perspective.areaId,
      nameUnchanged,
      reason,
    });
  });

  return report;
};

export const applyPerspectiveMigration = <T extends Ue5PerspectiveLike>(
  perspectives: readonly T[],
  areas: readonly PerspectiveAreaSelection[],
): { perspectives: T[]; changed: number } => {
  const report = createPerspectiveMigrationReport(perspectives, areas);
  const changes = new Map(report.changes.map((change) => [change.sourceIndex, change]));
  return {
    changed: report.changes.length,
    perspectives: perspectives.map((perspective, sourceIndex) => {
      const change = changes.get(sourceIndex);
      return change ? ({ ...perspective, areaId: change.areaId, area: change.toArea } as T) : perspective;
    }),
  };
};
