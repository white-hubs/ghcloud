import type { AxiosRequestConfig } from 'axios'

type RequestErrorType = 'axios' | 'http' | 'backend'

export interface BaseAPIResult<T=unknown> {
  error: { type: RequestErrorType; code: string | number; msg: string; } | null;
  code: number;
  data: T;
  message: string;
  timestamp: number;
}

export interface CreateRequestResponse {
  get: <T>(url: string, config?: AxiosRequestConfig) => Promise<BaseAPIResult<T>>;
  post: <T>(url: string, data: unknown, config?: AxiosRequestConfig) => Promise<BaseAPIResult<T>>;
  put: <T>(url: string, data: unknown, config?: AxiosRequestConfig) => Promise<BaseAPIResult<T>>;
  delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<BaseAPIResult<T>>;
  download: (url: string, data: unknown, config?: AxiosRequestConfig) => Promise<unknown>;
}

export interface BackendResultConfig {
  /** 表示后端请求状态码的属性字段 */
  codeKey: string;
  /** 表示后端请求数据的属性字段 */
  dataKey: string;
  /** 表示后端消息的属性字段 */
  msgKey: string;
  /** 后端业务上定义的成功请求的状态 */
  successCode: number | string;
}

/** 请求错误 */
export interface RequestError {
  /** 请求服务的错误类型 */
  type: RequestErrorType;
  /** 错误码 */
  code: string | number;
  /** 错误信息 */
  msg: string;
}
