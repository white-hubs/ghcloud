import type { EmergencyPlanTaskDraft } from "@ghcloud/cube-services-client/emergency-plan-ai.client";

type StoredExecutor = {
  executorType?: unknown;
  executorId?: unknown;
  user?: { id?: unknown; name?: unknown };
};

type StoredTask = Partial<EmergencyPlanTaskDraft> & {
  id?: unknown;
  executionContentJson?: unknown;
  equipmentJson?: unknown;
  executors?: StoredExecutor[];
};

export function normalizeStoredPlanTasks(value: unknown): EmergencyPlanTaskDraft[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((raw, index) => {
    const task = raw as StoredTask;
    const sourceTemplateId = normalizeId(task.sourceTemplateId);
    return {
      clientKey: normalizeId(task.id) || task.clientKey || createPlanTaskClientKey(),
      name: typeof task.name === "string" ? task.name : "",
      sortNo: index + 1,
      durationMinutes: typeof task.durationMinutes === "number" ? task.durationMinutes : null,
      executionContents: readJsonStringArray(task.executionContentJson, task.executionContents),
      equipment: readJsonStringArray(task.equipmentJson, task.equipment),
      locationDesc: typeof task.locationDesc === "string" ? task.locationDesc : "",
      longitude: toCoordinate(task.longitude),
      latitude: toCoordinate(task.latitude),
      remark: typeof task.remark === "string" ? task.remark : "",
      sourceType: task.sourceType === "TEMPLATE" || task.sourceType === "MANUAL" ? task.sourceType : "AI",
      sourceTemplateId,
      templateName: typeof task.templateName === "string" ? task.templateName : null,
      templateConfidence: typeof task.templateConfidence === "number" ? task.templateConfidence : null,
      templateReason: typeof task.templateReason === "string" ? task.templateReason : null,
      executors: Array.isArray(task.executors)
        ? task.executors.flatMap((executor) => {
            const executorId = normalizeId(executor.executorId);
            const executorType = executor.executorType;
            return executorId && ["DEPARTMENT", "ROLE", "POST", "PERSON"].includes(String(executorType))
              ? [
                  {
                    clientKey: createPlanTaskClientKey(),
                    executorType: executorType as "DEPARTMENT" | "ROLE" | "POST" | "PERSON",
                    executorId,
                    user:
                      executor.user && typeof executor.user.name === "string"
                        ? { id: normalizeId(executor.user.id), name: executor.user.name }
                        : undefined,
                  },
                ]
              : [];
          })
        : [],
    };
  });
}

export function toApprovalTasks(tasks: EmergencyPlanTaskDraft[]) {
  return tasks.map((task, index) => ({
    name: task.name.trim(),
    sortNo: index + 1,
    durationMinutes: task.durationMinutes,
    executionContentJson: JSON.stringify(task.executionContents.map((item) => item.trim()).filter(Boolean)),
    equipmentJson: JSON.stringify(task.equipment.map((item) => item.trim()).filter(Boolean)),
    locationDesc: task.locationDesc.trim() || null,
    longitude: task.longitude ?? null,
    latitude: task.latitude ?? null,
    remark: task.remark.trim() || null,
    sourceType: task.sourceType,
    sourceTemplateId: toIdOrNull(task.sourceTemplateId),
    executors: task.executors.flatMap((executor) => {
      const executorId = toIdOrNull(executor.executorId);
      return executorId ? [{ executorType: executor.executorType, executorId }] : [];
    }),
  }));
}

export function validatePlanTasks(tasks: EmergencyPlanTaskDraft[]): string {
  if (!tasks.length) {
    return "请先完成任务拆解";
  }
  const unnamedIndex = tasks.findIndex((task) => !task.name.trim());
  if (unnamedIndex >= 0) {
    return `第${unnamedIndex + 1}个任务名称不能为空`;
  }
  return "";
}

export function clonePlanTasks(tasks: EmergencyPlanTaskDraft[]): EmergencyPlanTaskDraft[] {
  return tasks.map((task) => ({
    ...task,
    executionContents: [...task.executionContents],
    equipment: [...task.equipment],
    executors: task.executors.map((executor) => ({ ...executor })),
  }));
}

export function createPlanTaskClientKey(): string {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readJsonStringArray(json: unknown, fallback: unknown): string[] {
  if (Array.isArray(fallback)) {
    return fallback.filter((item): item is string => typeof item === "string");
  }
  if (typeof json !== "string" || !json.trim()) {
    return [];
  }
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function normalizeId(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

function toIdOrNull(value: unknown): string | null {
  const normalized = normalizeId(value);
  return normalized && /^\d+$/.test(normalized) ? normalized : null;
}

function toCoordinate(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const coordinate = typeof value === "number" ? value : Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
}
