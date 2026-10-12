import type { CubeRequest } from "@ghcloud/cube-gateway";
import { normalServiceStatus } from "@ghcloud/cube-gateway";

class VideoMonitorRequestError extends Error {
  public readonly errorMessage: string;

  public constructor(message: string) {
    super(message);
    this.name = "VideoMonitorRequestError";
    this.errorMessage = message;
  }

  public toJSON(): { errorMessage: string; message: string } {
    return {
      errorMessage: this.errorMessage,
      message: this.message,
    };
  }
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

function extractErrorMessage(body: unknown, text: string): string {
  const nestedMessage = extractNestedErrorMessage(body, 0);
  if (nestedMessage) {
    return nestedMessage;
  }
  return text.trim() || "请求失败";
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
  return Boolean(code && code !== "0" && code !== "200" && extractNestedErrorMessage(body, 0));
}

function parseJson(text: string): unknown {
  if (!text.trim()) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function readCheckedText(request: CubeRequest): Promise<string> {
  const resp = await request.send();
  const text = await resp.text();
  const body = parseJson(text);
  if (!normalServiceStatus(resp.status) || isFailureEnvelope(body)) {
    throw new VideoMonitorRequestError(extractErrorMessage(body, text));
  }
  return text;
}

export async function sendVideoMonitorText(request: CubeRequest): Promise<string> {
  return readCheckedText(request);
}

export async function sendVideoMonitorVoid(request: CubeRequest): Promise<void> {
  await readCheckedText(request);
}
