import type { CubeRequest } from "@ghcloud/cube-gateway";
import { normalServiceStatus } from "@ghcloud/cube-gateway";

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
  return "请求失败";
}

function isFailureEnvelope(body: unknown): boolean {
  if (!body || typeof body !== "object") {
    return false;
  }
  const record = body as Record<string, unknown>;
  if (record.success === false) {
    return true;
  }
  if (typeof record.code === "number" && record.code !== 0 && record.code !== 200 && typeof record.message === "string") {
    return true;
  }
  return false;
}

export async function sendRiskJson<T>(request: CubeRequest): Promise<T> {
  const resp = await request.send();
  const body = await resp.json<unknown>();
  if (!normalServiceStatus(resp.status) || isFailureEnvelope(body)) {
    throw new Error(extractErrorMessage(body));
  }
  return body as T;
}

export async function sendRiskVoid(request: CubeRequest): Promise<void> {
  const resp = await request.send();
  if (!normalServiceStatus(resp.status)) {
    let body: unknown;
    try {
      body = await resp.json();
    } catch {
      body = null;
    }
    throw new Error(extractErrorMessage(body));
  }
}
