import { CubeGatewayResponseError, normalServiceStatus, type CubeRequest } from "@ghcloud/cube-gateway";

class ElectricalSafetyRequestError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "ElectricalSafetyRequestError";
  }
}

function findErrorMessage(value: unknown, depth = 0): string | undefined {
  if (depth > 3 || value == null || typeof value !== "object") {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value.map((item) => findErrorMessage(item, depth + 1)).find((message) => Boolean(message));
  }

  const record = value as Record<string, unknown>;
  for (const candidate of [record.errorMessage, record.message, record.msg, record.error_description, record.errorDetail]) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  for (const key of ["data", "error", "errors", "detail"]) {
    const message = findErrorMessage(record[key], depth + 1);
    if (message) return message;
  }
  return undefined;
}

function isFailureEnvelope(body: unknown): boolean {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return false;
  }
  const record = body as Record<string, unknown>;
  if (record.success === false) return true;

  const code = typeof record.code === "number" || typeof record.code === "string" ? String(record.code) : "";
  return Boolean(code && code !== "0" && code !== "200" && findErrorMessage(body));
}

async function readJsonBody(request: CubeRequest): Promise<{ status: number; body: unknown }> {
  const response = await request.send();
  const text = await response.text();
  if (!text) return { status: response.status, body: null };

  try {
    return { status: response.status, body: JSON.parse(text) as unknown };
  } catch {
    return { status: response.status, body: text };
  }
}

function ensureSuccess(status: number, body: unknown): void {
  if (normalServiceStatus(status) && !isFailureEnvelope(body)) return;
  throw new ElectricalSafetyRequestError(findErrorMessage(body) ?? "请求失败");
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

export async function sendElectricalSafetyJson<T>(request: CubeRequest): Promise<T> {
  const { status, body } = await readJsonBody(request);
  ensureSuccess(status, body);
  return unwrap<T>(body);
}

/** 查询可选资源时将 HTTP 404 视为“暂无数据”，其他失败仍正常抛出。 */
export async function sendElectricalSafetyOptionalJson<T>(request: CubeRequest): Promise<T | null> {
  let response: { status: number; body: unknown };
  try {
    response = await readJsonBody(request);
  } catch (error) {
    if (error instanceof CubeGatewayResponseError && error.status === 404) return null;
    throw error;
  }

  const { status, body } = response;
  if (status === 404) return null;

  ensureSuccess(status, body);
  return unwrap<T>(body);
}

/** 空响应成功时返回 undefined；失败响应仍解析错误信息并抛出异常。 */
export async function sendElectricalSafetyVoid(request: CubeRequest): Promise<void> {
  const { status, body } = await readJsonBody(request);
  ensureSuccess(status, body);
}

export async function sendElectricalSafetyBlob(request: CubeRequest): Promise<Blob> {
  const response = await request.send();
  if (normalServiceStatus(response.status)) return response.blob();

  const text = await response.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text) as unknown;
  } catch {
    // 非 JSON 错误响应使用原文本作为兜底信息。
  }
  ensureSuccess(response.status, body);
  throw new ElectricalSafetyRequestError("请求失败");
}
