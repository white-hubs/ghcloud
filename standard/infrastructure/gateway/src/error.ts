
/**
 * 旧的开河通用返回结构体，新 restful 规范不再包通用外层
 */
export interface LegacyServiceError<T> {
  data: T;
}

/**
 * 服务 http status 正常响应极限
 */
export const SERVICE_STATUS_NORMAL_LIMIT = 299

export function normalServiceStatus (status: number): boolean {
  return status <= SERVICE_STATUS_NORMAL_LIMIT
}

export enum ServiceErrorStatusEnum {
  BAD_REQUEST = 400,
  NOT_AUTH = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

export interface ServiceError {
  readonly errorCode: string;
  readonly errorMessage: string;
  readonly errorDetail: string;
  errorDescription?: string;
  code?: string;
  status?: string;
  message?: string;
  details?: string;
}

export class ServiceErrorFactory {
  public static create (status: ServiceErrorStatusEnum, errorJSON: ServiceError): AbstractServiceError {
    // 兼容新的错误返回结构
    const errorCode = errorJSON.errorCode || errorJSON.code || errorJSON.status || ''
    const errorMessage = errorJSON.errorMessage || errorJSON.message || ''
    const errorDetail = errorJSON.errorDetail || errorJSON.details || ''
    const errorDescription = errorJSON.errorDescription || ''
    
    switch (status) {
      case ServiceErrorStatusEnum.BAD_REQUEST:
        return new BadRequestServiceError(errorCode, errorMessage, errorDetail, errorDescription)
      case ServiceErrorStatusEnum.NOT_FOUND:
        return new NotFountServiceError(errorCode, errorMessage, errorDetail, errorDescription)
      case ServiceErrorStatusEnum.NOT_AUTH:
        return new UnauthorizedServiceError(errorCode, errorMessage, errorDetail, errorDescription)
      default:
        return new UnknownServiceError(errorCode, errorMessage, errorDetail, errorDescription)
    }
  }
}

export abstract class AbstractServiceError extends Error implements ServiceError {
  public constructor (
    public readonly errorCode: string,
    public readonly errorMessage: string,
    public readonly errorDetail: string,
    public readonly errorDescription?: string,
  ) {
    super()
  }

  public toJSON (): ServiceError {
    return {
      errorCode: this.errorCode,
      errorMessage: this.errorMessage,
      errorDetail: this.errorDetail,
      errorDescription: this.errorDescription
    }
  }
}

/**
 * 400
 */
export class BadRequestServiceError extends AbstractServiceError {

}
/**
 * 401
 */
export class UnauthorizedServiceError extends AbstractServiceError {}
/**
 * 404
 */
export class NotFountServiceError extends AbstractServiceError {}
/**
 * 非 20x
 */
export class UnknownServiceError extends AbstractServiceError {}
