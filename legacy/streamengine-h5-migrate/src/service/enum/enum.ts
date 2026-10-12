import { getApiBaseUrL, getAuthHeaders } from '@ghcloud/cube-app-js-sdk'
import { HTTPClientImpl } from '../../infrastructure/http-client'
import { BaseAPIResult } from '../base-api'

class EnumService {
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL()??'/api',
    headers: getAuthHeaders()
  })

  public async getFormControlEnum (type: string): Promise<any[]> {
    const result = await this.client.get<any[]>(`/personnel/approval/biz/form/control/enum?type=${type}`)
    return result
  }
}

export const enumService = new EnumService()
