export enum HTTPStatus {
  SUCCESS = 200,
  SERVER_ERROR = 500
}

export enum HTTPClientErrorCode {
  ERROR_NOT_FOUND = -1,
  ERROR_HTTP_STATUS = 0
}

export const HTTPClientErrorCodeLabel: Record<HTTPClientErrorCode, { zhName: string; }> = {
  [HTTPClientErrorCode.ERROR_NOT_FOUND]: {
    zhName: '未知错误'
  },
  [HTTPClientErrorCode.ERROR_HTTP_STATUS]: {
    zhName: '请求状态错误'
  }
}

export interface HTTPClientOption {
  query: Record<string, string | number | boolean>;
  headers: Record<string, string>;
  pathParams: Record<string, string>;
  hideError?: boolean;
}

export interface HTTPClientGETOption extends HTTPClientOption {}

export interface HTTPClientPOSTOption extends HTTPClientOption {
  data: unknown;
}

export interface HTTPClientConfig {
  baseURL: string;
  headers: Record<string, unknown>;
}

export interface HTTPClient {
  get: <T>(api: string, option?: Partial<HTTPClientGETOption>) => Promise<T>;
  post: <T>(api: string, option?: Partial<HTTPClientPOSTOption>) => Promise<T>;
}

export class HTTPClientError extends Error {
  public constructor (public readonly code: HTTPClientErrorCode, public readonly message = '') {
    super()
  }
}
