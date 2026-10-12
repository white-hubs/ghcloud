import { CubeHeaders } from "@ghcloud/cube-protocol";

import type { CubeAuth } from "./auth";
import { makeBody, makeHeaders, makeURLParams, parseResponse } from "./core";
import { type ServiceError, ServiceErrorFactory, normalServiceStatus } from "./error";
import type {
  CubeCreateRequestOptions,
  CubeCustomRequestOptions,
  CubeDeleteRequestOptions,
  CubeGetRequestOptions,
  CubeListRequestOptions,
  CubeGatewayRequestOptions,
  CubeUpdateRequestOptions,
  CubeGateway,
} from "./gateway";
import type { Pagination } from "./pagination";

interface LegacyServiceError {
  readonly code: number;
  readonly message: string;
  readonly data: unknown;
}

interface LoginError {
  readonly error: string;
  readonly error_description: string;
}

function isLegacyServiceError(error: unknown): error is LegacyServiceError {
  return !!(error as Record<string, unknown>).code;
}
function isContainErrorDescription(error: unknown): error is LoginError {
  return !!(error as Record<string, unknown>).error_description;
}

/**
 * 开河服务请求通用方法
 */
class CubeRequestImpl implements CubeGateway {
  private readonly authHeaders = new Headers();

  public constructor(auth?: Partial<CubeAuth>) {
    auth && this.updateAuth(auth);
  }

  public async delete(options: CubeDeleteRequestOptions): Promise<void> {
    await this.request({
      url: makeURLParams(options.url, options.payload ?? {}),
      method: "DELETE",
    });
  }

  public async get<T>(options: CubeGetRequestOptions): Promise<T> {
    const url = makeURLParams(options.url, options.payload ?? {});
    const resp = await this.request({
      url,
      method: "GET",
    });
    return this.parseResponse(resp, options.responseType ?? "object");
  }

  public async getText(options: CubeGetRequestOptions): Promise<string> {
    const url = makeURLParams(options.url, options.payload ?? {});
    const resp = await this.request({
      url,
      method: "GET",
    });
    return resp.text();
  }

  public async list<T>(options: CubeListRequestOptions): Promise<Pagination<T>> {
    const url = makeURLParams(options.url, options.payload ?? {});
    const resp = await this.request({
      url,
      method: "GET",
    });
    return (await resp.json()) as Promise<Pagination<T>>;
  }

  public async create<T>(options: CubeCreateRequestOptions): Promise<T> {
    const resp = await this.request({
      ...options,
      method: "POST",
    });
    return this.parseResponse(resp, options.responseType ?? "object");
  }

  public async update<T>(options: CubeUpdateRequestOptions): Promise<T> {
    const resp = await this.request({
      ...options,
      method: "PUT",
    });
    return this.parseResponse(resp, options.responseType ?? "object");
  }

  public async custom<T>(options: CubeCustomRequestOptions): Promise<T> {
    let url = makeURLParams(options.url, options?.query ?? {});
    if (["GET", "DELETE"].includes(options.method) && !options.query) {
      url = makeURLParams(options.url, (options?.payload as Record<string, unknown>) ?? {});
    }
    const resp = await this.request({
      ...options,
      url,
    });
    return this.parseResponse(resp, options.responseType ?? "object");
  }

  public async customBlob(options: CubeCustomRequestOptions): Promise<Blob> {
    let url = makeURLParams(options.url, options?.query ?? {});
    if (["GET"].includes(options.method) && !options.query) {
      url = makeURLParams(options.url, (options?.payload as Record<string, unknown>) ?? {});
    }
    const resp = await this.request({
      ...options,
      url,
    });
    return resp.blob();
  }

  public updateAuth(auth: Partial<CubeAuth>): void {
    const { tenant, terminal, token } = auth;
    const headers = this.authHeaders;
    if (tenant + "" === "0") {
      headers.set(CubeHeaders.TENANT, "0");
    }
    if (tenant) {
      headers.set(CubeHeaders.TENANT, tenant);
    }
    if (token) {
      headers.set(CubeHeaders.AUTHORIZATION, `Bearer ${token}`);
    }
    if (terminal) {
      headers.set(CubeHeaders.TERMINAL, terminal);
    }
    headers.set("Content-Type", "application/json;charset=utf-8");
  }

  private async parseResponse<T>(resp: Response, responseType: CubeGatewayRequestOptions["responseType"]): Promise<T> {
    if (responseType !== "object") {
      return parseResponse(resp, responseType);
    }
    // TODO-migrate: 由于原来的使用中未直接指定 responseType，导致部分 void 返回值直接调用 resp.json() 时会失败，此处只能使用性能较低的兼容处理方式
    // 新版可直接调用 core 中的 parseResponse 方法，不会包含下列处理
    const respText = await resp.text();
    if (respText.includes("{")) {
      return JSON.parse(respText) as T;
    }
    if (respText.includes("[")) {
      return JSON.parse(respText) as T;
    }
    if (respText) {
      return respText as T;
    }
    return {} as T;
  }

  private async request(options: CubeGatewayRequestOptions): Promise<Response> {
    const headers = makeHeaders(options, this.authHeaders);
    const body = makeBody(options);

    const resp = await fetch(options.url, {
      method: options.method,
      headers,
      body: body as RequestInit["body"],
    });
    if (normalServiceStatus(resp.status)) {
      return resp;
    }
    const responseData = await resp.json();
    let error: ServiceError = responseData as ServiceError;
    if (isLegacyServiceError(responseData)) {
      error = {
        errorCode: `${responseData.code}`,
        errorMessage: responseData.message,
        errorDetail: typeof responseData.data === "string" ? `${responseData.data}` : JSON.stringify(responseData.data),
      };
    }
    if (isContainErrorDescription(responseData)) {
      error.errorDescription = `${responseData.error_description}`;
    }
    throw ServiceErrorFactory.create(resp.status, error);
  }
}

export { CubeRequestImpl as CubeGateway };
