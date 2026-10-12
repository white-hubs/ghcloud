import { getApiBaseUrL, getAuthHeaders } from '@ghcloud/cube-app-js-sdk'
import { HTTPClientImpl } from '../../infrastructure/http-client'
import { BaseAPIResult } from '../base-api'

class FaultService {
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL()??'/api',
    headers: getAuthHeaders()
  })

  /**
   *
   * @returns 故障类型列表
   */
  public async getFaultTypeList (businessType:string): Promise<{id:string;name:string}[]> {
    const result = await this.client.get<{id:string;name:string}[]>('/maintain/fault-type/list?applicationCode='+businessType)
    return result
  }

}

export const faultService = new FaultService()