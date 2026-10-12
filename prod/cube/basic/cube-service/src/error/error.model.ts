export abstract class AbstractCubeError extends Error {
  protected constructor (private readonly errorCode: string, private readonly errorMessage: string, private readonly errorDetail: string) {
    super()
  }

  public getErrorCode (): string {
    return this.errorCode
  }

  public getErrorMessage (): string {
    return this.errorMessage
  }

  public getErrorDetail (): string {
    return this.errorDetail
  }
}

export enum ErrorStatusEnum {
  OK = 200,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  PRECONDITION_FAILED = 412,
  NOT_ANALYSIS = 406,
  FAILED = 500
}

export enum ErrorCodeEnum {
  NOT_FOUND = '404',
  UNAUTHORIZED = '401',
  PRECONDITION_FAILED = '412',
  NOT_ANALYSIS = '406',
  FAILED = '500'

}

export class CubeServiceNotFountError extends AbstractCubeError {
  public constructor (servicePath: string) {
    super(ErrorCodeEnum.NOT_FOUND, servicePath, servicePath)
  }
}

export class CubeServiceUnauthorizedError extends AbstractCubeError {
  public constructor (servicePath: string) {
    super(ErrorCodeEnum.UNAUTHORIZED, servicePath, servicePath)
  }
}
export class CubeServicePreconditionFailedError extends AbstractCubeError {
  public constructor (servicePath: string) {
    // logger.info(servicePath, 'ssss')
    super(ErrorCodeEnum.UNAUTHORIZED, servicePath, servicePath)
  }
}
export class CubeServiceFailedError extends AbstractCubeError {
  public constructor (servicePath: string) {
    // logger.info(servicePath, 'ssss')
    super(ErrorCodeEnum.UNAUTHORIZED, servicePath, servicePath)
  }
}
export class CubeServiceNotAnalysisError extends AbstractCubeError {
  public constructor (servicePath: string) {
    // logger.info(servicePath, 'ssss')
    super(ErrorCodeEnum.NOT_ANALYSIS, servicePath, servicePath)
  }
}

export class CubeServiceDefaultError extends AbstractCubeError {
  public constructor (errorStatus: number) {
    super(`${errorStatus}`, '', '')
  }
}

/**
 * 旧的开河通用返回结构体，新 restful 规范不再包通用外层
 */
export interface CubeLegacyErrorResponse<T> {
  data: T;
}
