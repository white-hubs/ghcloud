import { getApiBaseUrL, getAuthHeaders } from '@ghcloud/cube-app-js-sdk'
import { HTTPClientImpl } from '../../infrastructure/http-client'
import { BaseAPIResult } from '../base-api'

interface ComonInterFace {
  id: string;
  name: string;
}

class OfficialService {
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL()??'/api',
    headers: getAuthHeaders()
  })

  /**
   * @param params  sealName 印章名称
   * @returns 印章列表
   */
  public async getOfficialSealList (params?: { sealName: string; }): Promise<ComonInterFace[]> {
    const result = await this.client.get<ComonInterFace[]>('/official/officialSeal/widget/list', { query: params })
    return result
  }

  /**
   * @param params name 事项名称
   * @returns 督办事项类型列表
   */
  public async getFocusWorkTypeList (params?: { name: string; }): Promise<ComonInterFace[]> {
    const result = await this.client.get<ComonInterFace[]>('/official/focusWork/category/weight/list', { query: params })
    return result
  }

  /**
   * @param params id 督办事件ID
   * @returns 督办事件
   */
  public async getFocusWork (params: { id: string; }): Promise<ComonInterFace> {
    const result = await this.client.get<ComonInterFace>(`/official/focusWork/weight/${params.id}`)
    return result
  }

  /**
   * @returns 督办事项状态列表
   */
  public async getFocusWorkStatusList (): Promise<ComonInterFace[]> {
    const result = await this.client.get<ComonInterFace[]>('/official/focusWork/weight/status/list')
    return result
  }

  /**
  * @returns 督办事项列表
  */
  public async getFocusWorkList (): Promise<ComonInterFace[]> {
    const result = await this.client.get<ComonInterFace[]>('/official/focusWork/weight/list')
    return result
  }

  /**
   *
   * @param params id 督办事件ID
   * @returns 督办事件工作要求
   */
  public async getFocusWorkListRequirement (params: { id: string; }): Promise<ComonInterFace> {
    const result = await this.client.get<ComonInterFace>(`/official/focusWork/weight/${params.id}/requirement`)
    return result
  }

  /**
   *
   * @param params id 督办事件ID
   * @returns 督办事件完成时间
   */
  public async getFocusWorkCompleteTime (params: { id: string; }): Promise<ComonInterFace> {
    const result = await this.client.get<ComonInterFace>(`/official/focusWork/weight/${params.id}/completeTime`)
    return result
  }
}

export const officialService = new OfficialService()
