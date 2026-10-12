import { getApiBaseUrL, getAuthHeaders } from '@ghcloud/cube-app-js-sdk'
import { HTTPClientImpl } from '../../infrastructure/http-client'
import { BaseAPIResult } from '../base-api'

class OutSource {
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL()??'/api',
    headers: getAuthHeaders()
  })
  public async outsourceCompanyList (deviceId:string): Promise<{name:string;id:string;}[]> {
    const result = await this.client.get<{name:string;id:string;}[]>('/maintain/outsource/company/list',{
    query:{
      pageNumber:1,
    pageSize:1000,
    deviceId
    }
    })
    return result
  }
  public async outsourceMode (companyId:string
    ): Promise<{name:string;id:string}[]> {
    const result = await this.client.get<{name:string;id:string}[]>('/maintain/outsource/model/listByCompany',{
    query:{
      pageNumber:1,
    pageSize:1000,
    companyId
    }
    })
    return result
  }
}




export const OutSourceService = new OutSource()
