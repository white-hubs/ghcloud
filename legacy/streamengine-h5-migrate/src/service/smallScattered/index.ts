import { getApiBaseUrL, getAuthHeaders } from '@ghcloud/cube-app-js-sdk'
import { HTTPClientImpl } from '../../infrastructure/http-client'
import { BaseAPIResult } from '../base-api'

class SmallScattered {
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL()??'/api',
    headers: getAuthHeaders()
  })
  //小散工程名称列表
  public async projectNameList (): Promise<{projectName:string;ApplyId:string}[]> {
    const result = await this.client.get<{projectName:string;ApplyId:string}[]>('/loose-works/project/apply/nameList')
    return result
  }
  /** 工程进度跟踪列表 */
  public async projectScheduleList(query: any): Promise<any>  {
    const result = await this.client.get<{name:string;id:string}[]>('/loose-works/project/schedule/list',{query})
    return result
  }

  public async outsourceCompanyList (): Promise<{name:string;id:string}[]> {
    const result = await this.client.get<{name:string;id:string}[]>('/maintain/outsource/company/list',{
    query:{
      pageNumber:1,
    pageSize:1000
    }
    })
    return result
  }
  public async outsourceMode (): Promise<{name:string;id:string}[]> {
    const result = await this.client.get<{name:string;id:string}[]>('/maintain/outsource/model/list',{
    query:{
      pageNumber:1,
    pageSize:1000
    }
    })
    return result
  }
}




export const smallScattered = new SmallScattered()
