import type { CubeRequest } from "@ghcloud/cube-gateway";
import { normalServiceStatus } from "@ghcloud/cube-gateway";

class HazardGovernanceRequestError extends Error {
  public readonly errorMessage: string;

  public constructor(message: string) {
    super(message);
    this.name = "HazardGovernanceRequestError";
    this.errorMessage = message;
  }

  public toJSON(): { errorMessage: string; message: string } {
    return {
      errorMessage: this.errorMessage,
      message: this.message,
    };
  }
}

function extractErrorMessage(body: unknown): string {
  if (!body || typeof body !== "object") {
    return "请求失败";
  }
  const record = body as Record<string, unknown>;
  const candidates = [record.errorMessage, record.message, record.msg, record.error_description];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  if (typeof record.errorDetail === "string" && record.errorDetail.trim()) {
    return record.errorDetail.trim();
  }
  for (const key of ["data", "error", "errors", "detail"]) {
    const nestedMessage = extractNestedErrorMessage(record[key], 1);
    if (nestedMessage) {
      return nestedMessage;
    }
  }
  return "请求失败";
}

function extractNestedErrorMessage(value: unknown, depth: number): string | undefined {
  if (depth > 3 || !value || typeof value !== "object") {
    return undefined;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = extractNestedErrorMessage(item, depth + 1);
      if (message) {
        return message;
      }
    }
    return undefined;
  }
  const record = value as Record<string, unknown>;
  const candidates = [record.errorMessage, record.message, record.msg, record.error_description, record.errorDetail];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  for (const key of ["data", "error", "errors", "detail"]) {
    const message = extractNestedErrorMessage(record[key], depth + 1);
    if (message) {
      return message;
    }
  }
  return undefined;
}

function isFailureEnvelope(body: unknown): boolean {
  if (!body || typeof body !== "object") {
    return false;
  }
  const record = body as Record<string, unknown>;
  if (record.success === false) {
    return true;
  }
  const code = typeof record.code === "number" || typeof record.code === "string" ? String(record.code) : "";
  if (code && code !== "0" && code !== "200" && extractErrorMessage(body) !== "请求失败") {
    return true;
  }
  return false;
}

async function readJsonBody(resp: Awaited<ReturnType<CubeRequest["send"]>>): Promise<unknown> {
  const text = await resp.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function sendHazardJson<T>(request: CubeRequest): Promise<T> {
  const resp = await request.send();
  const body = await readJsonBody(resp);
  if (!normalServiceStatus(resp.status) || isFailureEnvelope(body)) {
    const errorMessage = extractErrorMessage(body);
    throw new HazardGovernanceRequestError(errorMessage);
  }
  return body as T;
}

export async function sendHazardVoid(request: CubeRequest): Promise<void> {
  const resp = await request.send();
  const body = await readJsonBody(resp);
  if (!normalServiceStatus(resp.status) || isFailureEnvelope(body)) {
    const errorMessage = extractErrorMessage(body);
    throw new HazardGovernanceRequestError(errorMessage);
  }
}
