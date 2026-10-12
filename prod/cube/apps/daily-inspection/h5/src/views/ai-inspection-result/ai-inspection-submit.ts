import type {
  InspectionImageAnalyzeGroup,
  InspectionImageAnalyzeResponse,
  InspectionImageAnalyzeResultItem,
  InspectRecordResultSource,
  InspectStandard,
  StandardItemType,
} from "@ghcloud/cube-daily-inspection-service";

type ResultType = "abnormal" | "normal" | "unknown";

type MutableAnalyzeItem = InspectionImageAnalyzeResultItem & {
  attachments?: Array<{ id: string }>;
  manualCompleted?: boolean;
};

export interface AiInspectionSubmitRouteQuery {
  taskId?: string;
  targetId?: string;
  targetCategory?: string;
  recordId?: string;
  areaId?: string;
  areaName?: string;
  targetName?: string;
  isTemporary?: string;
}

export interface AiInspectionSubmitTarget {
  targetId: string;
  recordId: string;
  targetCategory: string;
  areaId: string;
  areaName: string;
  targetName: string;
  isTemporary: boolean;
}

export interface AiInspectionSubmitCommand {
  targetId: string;
  recordId: string;
  targetCategory: string;
  areaId: string;
  areaName: string;
  targetName: string;
  resultSource: InspectRecordResultSource;
  commandModels: StandardItemType[];
}

interface StandardItemConfig {
  imageResult?: string;
  remarkResult?: string;
  itemTag?: string | null;
}

const getGroupsFromResponse = (target: InspectionImageAnalyzeResponse, type: ResultType): InspectionImageAnalyzeGroup[] => {
  if (type === "normal") {
    return target.normalItems ?? [];
  }
  if (type === "abnormal") {
    return target.abnormalItems ?? [];
  }
  return target.unrecognizedItems ?? [];
};

export const buildStandardItemConfigMap = (detail: InspectStandard): Map<string, StandardItemConfig> => {
  const map = new Map<string, StandardItemConfig>();
  for (const standard of detail.standardVOS ?? []) {
    for (const item of standard.standardItems ?? []) {
      const itemId = String(item.id ?? item.itemId ?? "");
      if (!itemId) {
        continue;
      }
      map.set(itemId, {
        imageResult: typeof item.imageResult === "string" ? item.imageResult : undefined,
        remarkResult: typeof item.remarkResult === "string" ? item.remarkResult : undefined,
        itemTag: item.itemTag ?? null,
      });
    }
  }
  return map;
};

export const buildCommandModelsFromAnalyzeResult = (
  analyzeResult: InspectionImageAnalyzeResponse,
  itemConfigMap: Map<string, StandardItemConfig>,
): StandardItemType[] => {
  const commandModels: StandardItemType[] = [];
  const categories: ResultType[] = ["normal", "abnormal", "unknown"];

  for (const category of categories) {
    for (const group of getGroupsFromResponse(analyzeResult, category)) {
      for (const sourceItem of group.standardItems ?? []) {
        const item = sourceItem as MutableAnalyzeItem;
        const resultValue = item.result?.itemValue;
        const hasResultOptions = (item.resultVO?.options?.length ?? 0) > 0;
        const isManualEntryWithoutResult = category === "unknown" && !hasResultOptions && item.manualCompleted === true;
        if (!resultValue && !isManualEntryWithoutResult) {
          continue;
        }

        const itemId = String(item.itemId ?? "");
        const config = itemConfigMap.get(itemId);
        const option = item.resultVO?.options?.find((current) => current.itemValue === resultValue);
        const fileIds = (item.attachments ?? []).map((file) => file.id).filter(Boolean);

        commandModels.push({
          tempAddFlag: false,
          standardId: String(group.standardId ?? item.standardId ?? ""),
          standardName: group.standardName ?? item.standardName ?? "",
          itemId,
          itemName: item.itemName ?? "",
          itemImageResult: config?.imageResult,
          remarkResult: config?.remarkResult,
          itemResultId: String(item.resultVO?.id ?? item.result?.id ?? ""),
          itemResultValue: resultValue ?? "",
          itemResultName: item.result?.itemName ?? option?.itemName ?? "",
          errorValueFlag: item.result?.errorFlag ?? option?.errorFlag ?? false,
          errorDesc: item.problemDesc || item.problemDescription || group.problemDescription || "",
          itemTag: config?.itemTag ?? null,
          fileIds,
        } as StandardItemType);
      }
    }
  }

  return commandModels;
};

export const resolveSubmitTarget = (
  query: AiInspectionSubmitRouteQuery,
  detail?: InspectStandard,
  fallbackTargetName?: string,
): AiInspectionSubmitTarget => {
  const isTemporary = query.isTemporary === "true";
  return {
    isTemporary,
    targetId: String(detail?.targetId ?? query.targetId ?? ""),
    recordId: String(detail?.recordId ?? query.recordId ?? ""),
    targetCategory: String(detail?.targetCategory ?? query.targetCategory ?? ""),
    areaId: String(detail?.areaId ?? query.areaId ?? ""),
    areaName: String(detail?.areaName ?? query.areaName ?? ""),
    targetName: String(detail?.targetName ?? query.targetName ?? fallbackTargetName ?? ""),
  };
};

export const buildSubmitCommand = (
  target: AiInspectionSubmitTarget,
  commandModels: StandardItemType[],
  resultSource: InspectRecordResultSource,
): AiInspectionSubmitCommand => ({
  targetId: target.targetId,
  recordId: target.recordId,
  targetCategory: target.targetCategory,
  areaId: target.areaId,
  areaName: target.areaName,
  targetName: target.targetName,
  resultSource,
  commandModels,
});
