import {
  CubeServiceDefaultError,
  CubeServiceNotFountError,
  CubeServicePreconditionFailedError,
  CubeServiceUnauthorizedError,
  CubeServiceFailedError,
  CubeServiceNotAnalysisError,
  ErrorStatusEnum
} from './error/error.model'
import type {
  CubeCreateRequestOptions,
  CubeCustomRequestOptions,
  CubeDeleteRequestOptions,
  CubeGetRequestOptions,
  CubeListRequestOptions,
  CubeRequestOptions,
  CubeUpdateRequestOptions,
  CubePagination,
  CubeRequest
} from './request.model'
import { AuthService } from './auth/auth.service'
import { CubeTerminalEnum } from './auth/auth.model'
import { logger } from './logger'

/**
 * 开河服务请求通用方法
 */
class CubeAuthRequest implements CubeRequest {
  /**
   * @param useAuth 请求是否携带鉴权信息
   */
  public constructor (private readonly useAuth: boolean) {}

  public async delete (options: CubeDeleteRequestOptions): Promise<void> {
    await this.request({
      url: this.makeURLParams(options.url, options.payload ?? {}),
      method: 'DELETE'
    })
  }

  public async get<T>(options: CubeGetRequestOptions): Promise<T> {
    const url = this.makeURLParams(options.url, options.payload ?? {})
    const resp = await this.request({
      url,
      method: 'GET'
    })
    return await resp.json() as Promise<T>
  }

  public async list<T>(options: CubeListRequestOptions): Promise<CubePagination<T>> {
    const url = this.makeURLParams(options.url, options.payload ?? {})
    const resp = await this.request({
      url,
      method: 'GET'
    })
    const respText = await resp.text()
    return (respText ? JSON.parse(respText) : {}) as Promise<CubePagination<T>>
  }

  public async create<T>(options: CubeCreateRequestOptions): Promise<T> {
    const resp = await this.request({
      ...options,
      method: 'POST'
    })
    logger.info('resp', resp)
    const respText = await resp.text()
    return (respText ? JSON.parse(respText) : {}) as Promise<T>
  }

  public async update<T>(options: CubeUpdateRequestOptions): Promise<T> {
    const resp = await this.request({
      ...options,
      method: 'PUT'
    })
    const respText = await resp.text()
    return (respText ? JSON.parse(respText) : {}) as Promise<T>
  }

  public async custom<T>(options: CubeCustomRequestOptions): Promise<T> {
    const resp = await this.request({
      ...options,
    })
    const respText = await resp.text()
    return (respText ? JSON.parse(respText) : {}) as Promise<T>
  }

  public async customBlob (options: CubeCustomRequestOptions): Promise<Blob> {
    const resp = await this.request({
      ...options,
    })
    return resp.blob()
  }

  private async request (options: CubeRequestOptions): Promise<Response> {
    const headers = this.makeHeaders(options)
    const body = this.makeBody(options)
    const resp = await fetch(options.url, {
      method: options.method,
      headers,
      body,
    })
    const status = resp.status as ErrorStatusEnum
    if (status === ErrorStatusEnum.OK) {
      return resp
    }
    // logger.error('request error', await resp.text())
    const textData = await resp.text()
    logger.info(status, 8888)
    switch (status) {
      case ErrorStatusEnum.NOT_FOUND:
        throw new CubeServiceNotFountError(options.url)
      case ErrorStatusEnum.UNAUTHORIZED:
        throw new CubeServiceUnauthorizedError(options.url)
      case ErrorStatusEnum.PRECONDITION_FAILED:
        throw new CubeServicePreconditionFailedError(textData ?? JSON.parse(textData)).getErrorDetail()
      case ErrorStatusEnum.FAILED:
        throw new CubeServiceFailedError(textData ?? JSON.parse(textData)).getErrorDetail()
      case ErrorStatusEnum.NOT_ANALYSIS:
        throw new CubeServiceNotAnalysisError(textData ?? JSON.parse(textData)).getErrorDetail()
      default:
        throw new CubeServiceDefaultError(resp.status)
    }
  }

  private makeBody (options: CubeRequestOptions): BodyInit | undefined {
    if (['GET', 'DELETE'].includes(options.method)) {
      return
    }
    if (this.payloadIsMetadata(options.payload)) {
      return options.payload
    }
    return JSON.stringify(options.payload)
  }

  private makeHeaders (options: CubeRequestOptions): Headers {
    const result = new Headers(options.headers)
    if (!this.payloadIsMetadata(options.payload)) {
      result.set('Content-Type', 'application/json;charset=utf-8')
    }
    const publicHeaders = this.getPublicHeaders()
    publicHeaders.forEach((value, key) => {
      result.set(key, value)
    })
    return result
  }

  private payloadIsMetadata (payload: unknown): payload is BodyInit {
    return payload instanceof FormData || payload instanceof Blob || typeof payload === 'string'
  }

  private makeURLParams (url: string, payload: Record<string, unknown>): string {
    const urlStringParams = Object.entries(payload)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    if (!url.includes('?')) {
      return `${url}?${urlStringParams}`
    }
    return `${url}&${urlStringParams}`
  }

  private getPublicHeaders (): Headers {
    const headers: Record<string, string> = {
      // 目前只有业务端调用，直接写死，当 cube-service 需要用于其它调用场景时，提供自定义 `terminal` 能力
      terminal: CubeTerminalEnum.BUSINESS
    }
    if (this.useAuth) {
      Object.assign(headers, this.getAuthHeaders())
    }
    return new Headers(headers)
  }

  private getAuthHeaders (): Record<string, string> {
    const auth = AuthService.getCacheAuth()
    if (!auth) {
      throw new CubeServiceUnauthorizedError('')
    }
    const { tenant, authorization } = auth
    const headers: Record<string, string> = {}
    if (authorization) {
      headers.Authorization = `Bearer ${authorization}`
    }
    if (typeof tenant !== 'undefined') {
      headers.tenant = tenant
    }
    return headers
  }
}

const requesters = {
  defaultAuthRequest: new CubeAuthRequest(true),
  defaultPublicRequest: new CubeAuthRequest(false),
}

/**
 * 获取带鉴权信息的请求实例
 */
export function getAuthRequester (): CubeRequest {
  return requesters.defaultAuthRequest
}

/**
 * 获取不带鉴权信息的请求实例
 */
export function getPublicRequester (): CubeRequest {
  return requesters.defaultPublicRequest
}
