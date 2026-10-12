import { makeCustomRequest } from "@ghcloud/cube-gateway";
import type { InspectionAiGateway, InspectionAnalyzeResponseData } from "@ghcloud/cube-service-interface/inspection-ai";

interface InspectionAiErrorPayload {
  code?: string;
  message?: string;
  errors?: Array<{ code?: string; message?: string }>;
}

const parseErrorPayload = (value: unknown): InspectionAiErrorPayload => {
  if (typeof value === "string") {
    try {
      return parseErrorPayload(JSON.parse(value));
    } catch {
      return { message: value };
    }
  }
  if (!value || typeof value !== "object") {
    return {};
  }
  const payload = value as InspectionAiErrorPayload;
  if (!payload.code && typeof payload.message === "string") {
    const nested = parseErrorPayload(payload.message);
    if (nested.code) {
      return nested;
    }
  }
  return payload;
};

export class InspectionAiRequestError extends Error {
  public readonly errorMessage: string;

  public constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "InspectionAiRequestError";
    this.errorMessage = message;
  }

  public toJSON(): { code: string; errorMessage: string; message: string; status: number } {
    return {
      code: this.code,
      errorMessage: this.errorMessage,
      message: this.message,
      status: this.status,
    };
  }
}

export const analyzeInspectionImage: InspectionAiGateway["analyzeInspectionImage"] = async (params) => {
  const resp = await makeCustomRequest({
    method: "POST",
    url: "/gw-bff/inspection/image/analyze",
    payload: { ...params },
  }).send();
  const body = await resp.json<InspectionAnalyzeResponseData | InspectionAiErrorPayload>();
  if (resp.status < 200 || resp.status >= 300) {
    const payload = parseErrorPayload(body);
    const detail = payload.errors?.[0];
    throw new InspectionAiRequestError(
      payload.code || detail?.code || "AI_ANALYZE_FAILED",
      payload.message || detail?.message || "AI识别失败，请重试",
      resp.status,
    );
  }
  return body as InspectionAnalyzeResponseData;
};
