import { BaseAPIResult } from '../service/base-api'
import { HTTPClient, HTTPClientConfig, HTTPClientError, HTTPClientGETOption, HTTPClientPOSTOption, HTTPStatus } from '../service/http-client'
import { Axios, AxiosRequestConfig, RawAxiosRequestHeaders } from 'axios'
import { showNotify } from 'vant'
import { deepMerge } from './object-util'

function instantiationAxios (config: HTTPClientConfig): Axios {
  return new Axios({
    baseURL: config.baseURL,
    headers: config.headers as unknown as RawAxiosRequestHeaders,
  })
}

export class HTTPClientImpl implements HTTPClient {
  private readonly config: HTTPClientConfig = {
    baseURL: '',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  }

  private readonly client: Axios

  public constructor (config: Partial<HTTPClientConfig>) {
    this.config = deepMerge(this.config, config)
    this.client = instantiationAxios(this.config)
  }

  public async get <T>(api: string, option: Partial<HTTPClientGETOption> = {}): Promise<T> {
    return this.baseRequest<T>({
      url: this.transformAPI(api, option.pathParams),
      method: 'GET',
      params: option.query,
      headers: option.headers,
      hideError: option?.hideError
    })
  }

  public async post <T>(api: string, data: unknown, option: Partial<HTTPClientPOSTOption> = {}): Promise<T> {
    return this.baseRequest<T>({
      url: this.transformAPI(api, option.pathParams),
      method: 'POST',
      params: option.query,
      headers: option.headers,
      data: JSON.stringify(data ?? option.data),
      hideError: option?.hideError
    })
  }

  public async uploadPost <T>(api: string, data: unknown, option: Partial<HTTPClientPOSTOption> = {}): Promise<T> {
    return this.baseRequest<T>({
      url: this.transformAPI(api),
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',...option.headers
      },
      data
    })
  }

  private transformAPI (api: string, pathParams: Record<string, string> = {}): string {
    let result = api
    for (const [key, value] of Object.entries(pathParams)) {
      result = result.replaceAll(`:${key}`, value)
    }
    return result
  }

  private async baseRequest<T>(config: AxiosRequestConfig & { hideError?: boolean }): Promise<T> {
    const result = await this.client.request(config)
    if (result.status !== HTTPStatus.SUCCESS) {
      let errorBody: BaseAPIResult<null>
      try {
        errorBody = JSON.parse(result.data)
      } catch (error) {
        errorBody = {
          code: HTTPStatus.SERVER_ERROR,
          message: '未知错误，请联系管理员',
          data: null,
          timestamp: 0
        }
      }
      // TODO(danke): 临时先统一处理报错消息提示，实际上 http-client 不应该依赖具体的业务组件
      !config.hideError && showNotify({
        message: errorBody.message,
        type: 'danger'
      })
      throw new HTTPClientError(errorBody.code, errorBody.message)
    }
    const respText = result.data
    if (respText) {
      return (respText.includes('{') ? JSON.parse(respText) : respText) as Promise<T>
    } else {
      return {} as Promise<T>
    }
    // return (respText ? respText.includes('{') && JSON.parse(respText) : {}) as Promise<T>
  }
}
