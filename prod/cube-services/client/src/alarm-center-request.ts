import type { CubeRequest } from "@ghcloud/cube-gateway";
import { normalServiceStatus } from "@ghcloud/cube-gateway";
import type { Pagination } from "@ghcloud/cube-service-interface/base";

class AlarmCenterRequestError extends Error {
  public readonly errorMessage: string;

  public constructor(message: string) {
    super(message);
    this.name = "AlarmCenterRequestError";
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

function extractErrorMessage(body: unknown): string {
  if (!body || typeof body !== "object") {
    return "请求失败";
  }
  const record = body as Record<string, unknown>;
  const candidates = [record.errorMessage, record.message, record.msg, record.error_description, record.errorDetail];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  for (const key of ["data", "error", "errors", "detail"]) {
    const nestedMessage = extractNestedErrorMessage(record[key], 1);
    if (nestedMessage) {
      return nestedMessage;
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

function unwrap<T>(value: unknown): T {
  let current = value;
  for (let i = 0; i < 4; i += 1) {
    if (current != null && typeof current === "object" && !Array.isArray(current) && "data" in current) {
      current = (current as { data: unknown }).data;
      continue;
    }
    break;
  }
  return current as T;
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

export function normalizePagination<T>(value: unknown): Pagination<T> {
  if (Array.isArray(value)) {
    return { records: value as T[], total: value.length, pages: 1 };
  }
  const record = value && typeof value === "object" ? (value as Partial<Pagination<T>>) : {};
  const records = Array.isArray(record.records) ? record.records : [];
  return {
    records,
    total: Number(record.total ?? records.length),
    pages: Number(record.pages ?? 1),
  };
}

export async function sendAlarmCenterJson<T>(request: CubeRequest): Promise<T> {
  const resp = await request.send();
  const body = await readJsonBody(resp);
  if (!normalServiceStatus(resp.status) || isFailureEnvelope(body)) {
    throw new AlarmCenterRequestError(extractErrorMessage(body));
  }
  return unwrap<T>(body);
}

export async function sendAlarmCenterVoid(request: CubeRequest): Promise<void> {
  const resp = await request.send();
  const body = await readJsonBody(resp);
  if (!normalServiceStatus(resp.status) || isFailureEnvelope(body)) {
    throw new AlarmCenterRequestError(extractErrorMessage(body));
  }
}
