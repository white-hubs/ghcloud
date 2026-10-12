import { getApiBaseUrL, getAuthHeaders } from '@ghcloud/cube-app-js-sdk'
import { HTTPClientImpl } from '../../infrastructure/http-client'
import { BaseAPIResult } from '../base-api'

class ProblemService {
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL()??'/api',
    headers: getAuthHeaders()
  })

  /**
   *
   * @returns 隐患类型列表
   */
  public async getProblemTypeList (): Promise<{id:string;name:string}[]> {
    const result = await this.client.get<{id:string;name:string}[]>('/maintain/hidden-danger-type/list')
    return result
  }

  /**
   *
   * @returns 隐患程度列表
   */
  public async getProblemLevelList (): Promise<{id:string;name:string}[]> {
    const result = await this.client.get<{id:string;name:string}[]>('/maintain/hidden-danger-level/list')
    return result
  }

}

export const problemService = new ProblemService()
