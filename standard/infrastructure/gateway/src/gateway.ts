import type { Pagination, PaginationQuery } from "./pagination";

type FetchBody = NonNullable<RequestInit["body"]>;

/**
 * [设计规范](https://guhecloud.apifox.cn/doc-3102753#http-request)
 */
export interface CubeGateway {
  /**
   * @throws { AbstractServiceError }
   */
  get: <T>(options: CubeGetRequestOptions) => Promise<T>;
  /**
   * @throws { AbstractServiceError }
   */
  list: <T>(options: CubeListRequestOptions) => Promise<Pagination<T>>;
  /**
   * @throws { AbstractServiceError }
   */
  create: <T>(options: CubeCreateRequestOptions) => Promise<T>;
  /**
   * @throws { AbstractServiceError }
   */
  update: <T>(options: CubeUpdateRequestOptions) => Promise<T>;
  /**
   * @throws { AbstractServiceError }
   */
  delete: (options: CubeDeleteRequestOptions) => Promise<void>;
  /**
   * @throws { AbstractServiceError }
   */
  custom: <T>(options: CubeCustomRequestOptions) => Promise<T>;
  /**
   * @throws { AbstractServiceError }
   */
  customBlob: (options: CubeCustomRequestOptions) => Promise<Blob>;
}

export interface CubeGatewayRequestOptions {
  url: string;
  /**
   * 根据不同的 method，payload 会自动转换成不同请求载荷
   * - GET: 转换为 `url query params（par1=value1&par2=value2）`
   * - DELETE: 转换为 `url query params（par1=value1&par2=value2）`
   * - POST: 转换为 `json string（{"par1": "value1"}）`
   * - PUT: 转换为 `json string（{"par1": "value1"}）`
   */
  payload?:
    | PaginationQuery<Record<string, unknown>>
    | Record<string, unknown>
    | FormData
    | Blob
    | string
    | Record<string, unknown>[]
    | string[]
    | FetchBody;
  headers?: Record<string, string> | Headers;
  /**
   * 是否由应用注册的全局错误处理器展示失败提示。
   *
   * @default true
   */
  showErrorMessage?: boolean;
  method: "GET" | "POST" | "DELETE" | "PUT";
  /**
   * 响应类型
   * - object: 自动解析为对象
   * - blob: 返回 Blob 对象
   * - string: 返回字符串
   * - number: 返回数字
   * - boolean: 返回布尔值
   * - bigint: 返回 BigInt
   *
   * @default 'object'
   */
  responseType?: "void" | "object" | "blob" | "string" | "number" | "boolean" | "bigint";
}

export type CubeGetRequestOptions = Omit<CubeGatewayRequestOptions, "method"> & {
  payload?: Record<string, unknown>;
};

export type CubeListRequestOptions = Omit<CubeGatewayRequestOptions, "method"> & {
  payload?: Record<string, unknown> | PaginationQuery<Record<string, unknown>>;
};

export type CubeCreateRequestOptions = Omit<CubeGatewayRequestOptions, "method"> & {
  payload?: Record<string, unknown> | Record<string, unknown>[];
};

export type CubeUpdateRequestOptions = Omit<CubeGatewayRequestOptions, "method"> & {
  payload?: Record<string, unknown> | Record<string, unknown>[];
};

export type CubeDeleteRequestOptions = Omit<CubeGatewayRequestOptions, "method"> & {
  payload?: Record<string, unknown>;
};

export type CubeCustomRequestOptions = CubeGatewayRequestOptions & {
  payload?: Record<string, unknown> | PaginationQuery<Record<string, unknown>> | Blob | FormData | string | unknown[];
  /**
   * GET/DELETE 的 URL 查询参数。custom DELETE 显式传入 query 时，payload 将作为请求体发送。
   */
  query?: Record<string, unknown> | PaginationQuery<Record<string, unknown>>;
};
