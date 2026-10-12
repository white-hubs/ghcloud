import type {
  CubeCreateRequestOptions,
  CubeCustomRequestOptions,
  CubeDeleteRequestOptions,
  CubeGatewayRequestOptions,
  CubeGetRequestOptions,
  CubeListRequestOptions,
  CubeUpdateRequestOptions,
} from "./gateway";

export const makeURLParams = (url: string, payload: Record<string, unknown>): string => {
  const urlStringParams = Object.entries(payload)
    .filter((ele) => typeof ele[1] !== "undefined")
    .map(([key, value]) => `${key}=${encodeURIComponent(`${value}`)}`)
    .join("&");
  if (!urlStringParams) {
    return url;
  }
  if (!url.includes("?")) {
    return `${url}?${urlStringParams}`;
  }
  return `${url}&${urlStringParams}`;
};

export const makeHeaders = (options: CubeGatewayRequestOptions, initHeaders?: Headers): Headers => {
  const headers = new Headers(initHeaders);
  // set default content type to json
  headers.set("Content-Type", "application/json;charset=utf-8");
  if (payloadIsMetadata(options.payload)) {
    headers.delete("Content-Type");
  }
  if (!options.headers) {
    return headers;
  }
  Object.entries(options.headers).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return headers;
};

export const makeBody = (options: CubeGatewayRequestOptions): RequestInit["body"] => {
  if (options.method === "GET") {
    return;
  }
  if (options.method === "DELETE" && (options as CubeCustomRequestOptions).query === undefined) {
    return;
  }
  if (payloadIsMetadata(options.payload)) {
    return options.payload;
  }
  return JSON.stringify(options.payload);
};

export type Requestinterceptor = (options: CubeGatewayRequestOptions) => CubeGatewayRequestOptions;

export interface CubeGatewayErrorEvent {
  error: unknown;
  options: CubeGatewayRequestOptions;
  responseBody?: unknown;
  status?: number;
}

export type GatewayErrorInterceptor = (event: CubeGatewayErrorEvent) => void;

const gatewayErrorInterceptors = new Set<GatewayErrorInterceptor>();

export const addGatewayErrorInterceptor = (interceptor: GatewayErrorInterceptor): (() => void) => {
  gatewayErrorInterceptors.add(interceptor);
  return () => gatewayErrorInterceptors.delete(interceptor);
};

function reportGatewayError(event: CubeGatewayErrorEvent): void {
  if (event.options.showErrorMessage === false) return;
  for (const interceptor of gatewayErrorInterceptors) {
    try {
      interceptor(event);
    } catch {
      // 错误提示器不能影响原始请求的 reject 语义。
    }
  }
}

export interface CubeRequest {
  send: () => Promise<CubeResponse>;
  addRequestInterceptor: (interceptor: Requestinterceptor) => void;
  removeRequestInterceptor: (interceptor: Requestinterceptor) => void;
}

export interface CubeResponse {
  status: number;
  json: <T>() => Promise<T>;
  text: () => Promise<string>;
  blob: () => Promise<Blob>;
}

/**
 * HTTP 状态码 >= 400 或业务失败响应不能作为成功请求继续向下执行。
 *
 * 保留状态码和响应体，业务层可以直接将 `message` 呈现给用户，调试时也不会丢失后端返回。
 */
export class CubeGatewayResponseError extends Error {
  public constructor(
    public readonly status: number,
    public readonly responseBody: unknown,
  ) {
    super(resolveGatewayErrorMessage({ status, responseBody }));
    this.name = "CubeGatewayResponseError";
  }
}

function findResponseMessage(value: unknown, depth = 0): string | undefined {
  if (depth > 3 || value == null || typeof value !== "object") {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value.map((item) => findResponseMessage(item, depth + 1)).find((message) => Boolean(message));
  }
  const record = value as Record<string, unknown>;
  for (const key of ["errorMessage", "message", "msg", "error_description", "errorDetail"]) {
    if (typeof record[key] === "string" && record[key].trim()) {
      return record[key].trim();
    }
  }
  for (const key of ["data", "error", "errors", "detail"]) {
    const message = findResponseMessage(record[key], depth + 1);
    if (message) return message;
  }
  return undefined;
}

function resolveBusinessErrorCode(responseBody: unknown): number | undefined {
  if (!responseBody || typeof responseBody !== "object" || Array.isArray(responseBody)) return undefined;
  const record = responseBody as Record<string, unknown>;
  for (const key of ["code", "status"]) {
    const value = record[key];
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
    if (Number.isFinite(parsed) && parsed >= 400) return parsed;
  }
  return undefined;
}

function resolveErrorCode(status: number | undefined, responseBody: unknown): number | undefined {
  if ((status ?? 0) >= 400) return status;
  return resolveBusinessErrorCode(responseBody);
}

export function resolveGatewayErrorMessage({ error, responseBody, status }: Partial<CubeGatewayErrorEvent>): string {
  const errorCode = resolveErrorCode(status, responseBody);
  if ((status ?? 0) >= 500 || (errorCode ?? 0) >= 500) {
    return "服务器异常，请稍后重试";
  }
  if (typeof responseBody === "string" && responseBody.trim()) return responseBody.trim();
  const backendMessage = findResponseMessage(responseBody);
  if (backendMessage) return backendMessage;

  switch (errorCode) {
    case 401:
      return "登录状态已过期，请重新登录";
    case 403:
      return "暂无操作权限";
    case 404:
      return "请求资源不存在";
    case 408:
      return "请求超时，请稍后重试";
    case 429:
      return "请求过于频繁，请稍后重试";
    default:
      if (error instanceof TypeError) return "网络异常，请检查网络后重试";
      return "请求失败，请稍后重试";
  }
}

function isFailureEnvelope(body: unknown): boolean {
  if (body == null || typeof body !== "object" || Array.isArray(body)) return false;
  const record = body as Record<string, unknown>;
  if (record.success === false) return true;
  return resolveBusinessErrorCode(body) !== undefined;
}

async function parseJsonOrUndefined<T>(resp: Response): Promise<T> {
  const text = await resp.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

async function parseErrorBody(resp: Response): Promise<unknown> {
  const text = await resp.text();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

class CubeRequestImpl implements CubeRequest {
  private readonly requestInterceptors: Set<(options: CubeGatewayRequestOptions) => CubeGatewayRequestOptions> = new Set();

  public constructor(private readonly options: CubeGatewayRequestOptions) {}

  public addRequestInterceptor = (interceptor: (options: CubeGatewayRequestOptions) => CubeGatewayRequestOptions): void => {
    this.requestInterceptors.add(interceptor);
  };

  public removeRequestInterceptor = (interceptor: (options: CubeGatewayRequestOptions) => CubeGatewayRequestOptions): void => {
    this.requestInterceptors.delete(interceptor);
  };

  public send = async (): Promise<CubeResponse> => {
    let options = { ...this.options };
    options.headers = makeHeaders(options, options.headers as Headers);
    for (const interceptor of this.requestInterceptors) {
      options = interceptor(options);
    }
    let resp: Response;
    try {
      resp = await fetch(options.url, {
        method: options.method,
        headers: options.headers,
        body: makeBody(options),
      });
    } catch (error) {
      reportGatewayError({ error, options });
      throw error;
    }
    if (resp.status >= 400) {
      const responseBody = await parseErrorBody(resp);
      const error = new CubeGatewayResponseError(resp.status, responseBody);
      reportGatewayError({ error, options, responseBody, status: resp.status });
      throw error;
    }
    const responseBody = await parseErrorBody(resp.clone());
    if (isFailureEnvelope(responseBody)) {
      const error = new CubeGatewayResponseError(resp.status, responseBody);
      reportGatewayError({ error, options, responseBody, status: resp.status });
      throw error;
    }
    return {
      status: resp.status,
      json: async <T>(): Promise<T> => {
        return parseJsonOrUndefined<T>(resp);
      },
      text: async (): Promise<string> => {
        return resp.text();
      },
      blob: async (): Promise<Blob> => {
        return resp.blob();
      },
    };
  };
}

const contextStack: Requestinterceptor[] = [];

export const withContext = <T>(requestInterceptor: Requestinterceptor, fn: (...args: unknown[]) => T): T => {
  contextStack.push(requestInterceptor);
  const result = fn();
  contextStack.pop();
  return result;
};

export const makeRequest = (options: CubeGatewayRequestOptions): CubeRequest => {
  const contextRequestInterceptor = contextStack[contextStack.length - 1];
  if (contextRequestInterceptor) {
    options = contextRequestInterceptor(options);
  }
  return new CubeRequestImpl({
    ...options,
  });
};

export const makeCustomRequest = (options: CubeCustomRequestOptions): CubeRequest => {
  let url = makeURLParams(options.url, options?.query ?? {});
  if (["GET", "DELETE"].includes(options.method) && !options.query) {
    url = makeURLParams(options.url, (options?.payload as Record<string, unknown>) ?? {});
  }
  return makeRequest({
    ...options,
    url,
  });
};

export const makeGETRequest = (options: CubeGetRequestOptions): CubeRequest => {
  return makeRequest({
    ...options,
    url: makeURLParams(options.url, options.payload ?? {}),
    method: "GET",
  });
};

export const makeListRequest = (options: CubeListRequestOptions): CubeRequest => {
  return makeRequest({
    ...options,
    url: makeURLParams(options.url, options.payload ?? {}),
    method: "GET",
  });
};

export const makeDELETERequest = (options: CubeDeleteRequestOptions): CubeRequest => {
  return makeRequest({
    ...options,
    url: makeURLParams(options.url, options.payload ?? {}),
    method: "DELETE",
  });
};

export const makeCreateRequest = (options: CubeCreateRequestOptions): CubeRequest => {
  return makeRequest({
    ...options,
    method: "POST",
  });
};

export const makeUpdateRequest = (options: CubeUpdateRequestOptions): CubeRequest => {
  return makeRequest({
    ...options,
    method: "PUT",
  });
};

export const parseResponse = async <T>(resp: Response, responseType: CubeGatewayRequestOptions["responseType"]): Promise<T> => {
  if (responseType === "void") {
    return undefined as unknown as T;
  }
  if (responseType === "blob") {
    return resp.blob() as unknown as T;
  }
  if (responseType === "string") {
    return resp.text() as unknown as T;
  }
  if (responseType === "number" || responseType === "boolean") {
    return resp.json() as unknown as T;
  }
  if (responseType === "bigint") {
    return BigInt(await resp.text()) as unknown as T;
  }
  return resp.json() as unknown as T;
};

function payloadIsMetadata(payload: unknown): payload is FormData | Blob | string {
  return payload instanceof FormData || payload instanceof Blob || typeof payload === "string";
}
