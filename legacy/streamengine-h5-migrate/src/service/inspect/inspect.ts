import { getApiBaseUrL, getAuthHeaders } from '@ghcloud/cube-app-js-sdk'
import { HTTPClientImpl } from '../../infrastructure/http-client'
import { BaseAPIResult } from '../base-api'

interface List{
  total: number;
  records: {id:string, name:string}[];
}

class InspectService {
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL()??'/api',
    headers: getAuthHeaders()
  })

  /**
   *
   * @returns 现场点列表 物联1.0
   */
  public async getInspectpointList (params: { pageSize: number; pageNumbe?: number; businessType?: string; receiveDepId?: string; keyword?: string; }): Promise<List> {
    const result = await this.client.get<List>('/maintain/inspect/pointList', { query: params })
    return result
  }
}

export const inspectService = new InspectService()
