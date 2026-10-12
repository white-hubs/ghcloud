import type { CubeRequest } from "@ghcloud/cube-gateway";
import { normalServiceStatus } from "@ghcloud/cube-gateway";

class IntelligentGrainRequestError extends Error {
  public readonly errorMessage: string;

  public constructor(message: string) {
    super(message);
    this.name = "IntelligentGrainRequestError";
    this.errorMessage = message;
  }
}

function extractErrorMessage(body: unknown): string {
  if (!body || typeof body !== "object") {
    return "请求失败";
  }
  const record = body as Record<string, unknown>;
  for (const candidate of [record.errorMessage, record.message, record.msg, record.error_description]) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
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
  const code = typeof record.code === "number" || typeof record.code === "string" ? String(record.code) : "";
  return Boolean(code && code !== "0" && code !== "200" && extractErrorMessage(body) !== "请求失败");
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

export async function sendIntelligentGrainJson<T>(request: CubeRequest): Promise<T> {
  const resp = await request.send();
  const body = await readJsonBody(resp);
  if (!normalServiceStatus(resp.status) || isFailureEnvelope(body)) {
    throw new IntelligentGrainRequestError(extractErrorMessage(body));
  }
  return body as T;
}

export async function sendIntelligentGrainVoid(request: CubeRequest): Promise<void> {
  const resp = await request.send();
  const body = await readJsonBody(resp);
  if (!normalServiceStatus(resp.status) || isFailureEnvelope(body)) {
    throw new IntelligentGrainRequestError(extractErrorMessage(body));
  }
}

export async function sendIntelligentGrainBlob(request: CubeRequest): Promise<Blob> {
  const resp = await request.send();
  if (!normalServiceStatus(resp.status)) {
    const body = await readJsonBody(resp);
    throw new IntelligentGrainRequestError(extractErrorMessage(body));
  }
  return resp.blob();
}
