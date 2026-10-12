export interface CubePagination<T> {
  total: number;
  page: number;
  pageSize: number;
  records: T[];
}

/**
 * [设计规范](https://guhecloud.apifox.cn/doc-3102753#http-request)
 */
export interface CubeRequest {
  get: <T>(options: CubeGetRequestOptions) => Promise<T>;
  list: <T>(options: CubeListRequestOptions) => Promise<CubePagination<T>>;
  create: <T>(options: CubeCreateRequestOptions) => Promise<T>;
  update: <T>(options: CubeUpdateRequestOptions) => Promise<T>;
  delete: (options: CubeDeleteRequestOptions) => Promise<void>;
  custom: <T>(options: CubeCustomRequestOptions) => Promise<T>;
  customBlob: (options: CubeCustomRequestOptions) => Promise<Blob>;
}

export interface CubeRequestOptions {
  url: string;
  /**
   * 根据不同的 method，payload 会自动转换成不同请求载荷
   * - GET: 转换为 `url query params（par1=value1&par2=value2）`
   * - DELETE: 转换为 `url query params（par1=value1&par2=value2）`
   * - POST: 转换为 `json string（{"par1": "value1"}）`
   * - PUT: 转换为 `json string（{"par1": "value1"}）`
   */
  payload?: Record<string, unknown> | FormData | Blob | string;
  headers?: Record<string, string>;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
}

export type CubeGetRequestOptions = Omit<CubeRequestOptions, 'method'> & {
  payload?: Record<string, unknown>;
}

export type CubeListRequestOptions = Omit<CubeRequestOptions, 'method'> & {
  payload?: Record<string, unknown>;
}

export type CubeCreateRequestOptions = Omit<CubeRequestOptions, 'method'> & {
  payload?: Record<string, unknown>;
}

export type CubeUpdateRequestOptions = Omit<CubeRequestOptions, 'method'> & {
  payload?: Record<string, unknown>;
}

export type CubeDeleteRequestOptions = Omit<CubeRequestOptions, 'method'> & {
  payload?: Record<string, unknown>;
}

export type CubeCustomRequestOptions = CubeRequestOptions & {
  payload?: Record<string, unknown> | Blob | FormData | string;
}
