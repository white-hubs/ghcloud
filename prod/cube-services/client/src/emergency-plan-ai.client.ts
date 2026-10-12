import { makeCustomRequest } from "@ghcloud/cube-gateway";
import type {
  EmergencyPlanAiApiError,
  EmergencyPlanAiGateway,
  EmergencyPlanTaskDecomposeResponse,
} from "@ghcloud/cube-service-interface/emergency-plan-ai";

import { useAuthRequest } from "./auth-request";

export type {
  EmergencyPlanContext,
  EmergencyPlanTaskDecomposeRequest,
  EmergencyPlanTaskDecomposeResponse,
  EmergencyPlanTaskDraft,
  EmergencyPlanTaskExecutorDraft,
  EmergencyPlanTaskExecutorType,
} from "@ghcloud/cube-service-interface/emergency-plan-ai";

export class EmergencyPlanAiRequestError extends Error {
  public constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly traceId?: string,
  ) {
    super(message);
    this.name = "EmergencyPlanAiRequestError";
  }
}

export const decomposeEmergencyPlanTasks: EmergencyPlanAiGateway["decomposeTasks"] = async (params) =>
  useAuthRequest(async () => {
    const response = await makeCustomRequest({
      method: "POST",
      url: "/gw-bff/emergency/plan-ai/tasks/decompose",
      payload: { ...params },
    }).send();
    const body = await response.json<EmergencyPlanTaskDecomposeResponse | EmergencyPlanAiApiError>();
    if (response.status < 200 || response.status >= 300) {
      const error = normalizeError(body);
      throw new EmergencyPlanAiRequestError(
        error.code || "PLAN_AI_DECOMPOSE_FAILED",
        error.message || "预案任务拆解失败，请重试",
        response.status,
        error.traceId,
      );
    }
    return body as EmergencyPlanTaskDecomposeResponse;
  });

function normalizeError(value: unknown): Partial<EmergencyPlanAiApiError> {
  if (typeof value === "string") {
    try {
      return normalizeError(JSON.parse(value));
    } catch {
      return { message: value };
    }
  }
  if (!value || typeof value !== "object") {
    return {};
  }
  const error = value as Partial<EmergencyPlanAiApiError>;
  if (!error.code && typeof error.message === "string") {
    const nested = normalizeError(error.message);
    return nested.code ? nested : error;
  }
  return error;
}
