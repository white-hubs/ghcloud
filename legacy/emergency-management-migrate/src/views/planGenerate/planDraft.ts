import type { EmergencyPlanTaskDraft } from "@ghcloud/cube-services-client/emergency-plan-ai.client";

/** 仅保存编辑进度；正文、基本信息、附件及合规结果使用预案原字段。 */
export type PlanDraftState = {
  schemaVersion: 1;
  currentStep: number;
  editMode: boolean;
  planGenerated: boolean;
  generatedPlanMetadata: { title: string; metadata: string; missingInfo: string[] } | null;
  planTasks: EmergencyPlanTaskDraft[];
  taskCandidates: EmergencyPlanTaskDraft[];
  taskWarnings: string[];
  taskDrawer: { visible: boolean; mode: "candidates" | "accepted"; editingCandidateKey: string | null };
  taskAdoption: { visible: boolean; candidate: EmergencyPlanTaskDraft | null; stepsText: string; equipmentText: string };
};

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const isStrings = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === "string");

const isTask = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }
  return (
    ["clientKey", "name", "locationDesc", "remark"].every((key) => typeof value[key] === "string") &&
    typeof value.sortNo === "number" &&
    (value.durationMinutes === null || typeof value.durationMinutes === "number") &&
    isStrings(value.executionContents) &&
    isStrings(value.equipment) &&
    ["AI", "MANUAL", "TEMPLATE"].includes(String(value.sourceType)) &&
    Array.isArray(value.executors) &&
    value.executors.every(
      (executor) =>
        isRecord(executor) &&
        typeof executor.executorId === "string" &&
        ["DEPARTMENT", "ROLE", "POST", "PERSON"].includes(String(executor.executorType)),
    )
  );
};

/** 不对任务使用正式任务归一化，保留空步骤、未选择的执行人和稳定的 clientKey。 */
export function parsePlanDraftState(value: unknown): PlanDraftState | null {
  if (typeof value !== "string" || !value) {
    return null;
  }
  try {
    const state = JSON.parse(value);
    if (!isRecord(state) || state.schemaVersion !== 1) {
      return null;
    }
    const { generatedPlanMetadata: metadata, taskDrawer: drawer, taskAdoption: adoption } = state;
    if (
      !Number.isInteger(state.currentStep) ||
      Number(state.currentStep) < 1 ||
      Number(state.currentStep) > 6 ||
      typeof state.editMode !== "boolean" ||
      typeof state.planGenerated !== "boolean" ||
      !(
        metadata === null ||
        (isRecord(metadata) &&
          typeof metadata.title === "string" &&
          typeof metadata.metadata === "string" &&
          isStrings(metadata.missingInfo))
      ) ||
      !Array.isArray(state.planTasks) ||
      !state.planTasks.every(isTask) ||
      !Array.isArray(state.taskCandidates) ||
      !state.taskCandidates.every(isTask) ||
      !isStrings(state.taskWarnings) ||
      !isRecord(drawer) ||
      typeof drawer.visible !== "boolean" ||
      !["candidates", "accepted"].includes(String(drawer.mode)) ||
      !(drawer.editingCandidateKey === null || typeof drawer.editingCandidateKey === "string") ||
      !isRecord(adoption) ||
      typeof adoption.visible !== "boolean" ||
      !(adoption.candidate === null || isTask(adoption.candidate)) ||
      typeof adoption.stepsText !== "string" ||
      typeof adoption.equipmentText !== "string"
    ) {
      return null;
    }
    return state as PlanDraftState;
  } catch {
    return null;
  }
}
