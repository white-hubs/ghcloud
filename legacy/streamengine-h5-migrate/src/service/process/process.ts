import { ProcessLine } from '../../domain/process'
import { getApiBaseUrL, getAuthHeaders } from '@ghcloud/cube-app-js-sdk'
import { HTTPClientImpl } from '../../infrastructure/http-client'
import { BaseAPIResult } from '../base-api'
import { getParams } from '../../utils'

const params=getParams()
class ProcessService {
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL()??'/api',
    headers: getAuthHeaders()
  })
   //如果为公开表单，不需要header
   private readonly publicClient = new HTTPClientImpl({
    baseURL: getApiBaseUrL()??'/api',
    headers:{tenant:params.tenant}
  })

  /** 流程路径 */
  public async getProcessLine (params: { processInstanceId?: string;flowKey?: string; }): Promise<ProcessLine[]> {
    const result = await this.client.get<ProcessLine[]>('/flow/process/historical/path/line', { query: params })
    return result
  }
  public async getPublicProcessLine (params: { processInstanceId?: string;flowKey?: string; }): Promise<ProcessLine[]> {
    const result = await this.publicClient.get<ProcessLine[]>('/flow/public/process/historical/path/line', { query: params })
    return result
  }

  /** 指定审批人 */
  public async approver (processInstanceId: string, taskKey: string, userIds: number[]): Promise<void> {
    const body = {
      processInstanceId, // 流程实例id
      taskKey, // 节点唯一标识
      userIds, // 指定的审批人员的id
    }
    await this.client.post('/flow/process/task/appoint-approver', body)
  }

  /** 预减签 */
  public async preReduceSign (processInstanceId: string, taskKey: string, userIds: string[]): Promise<void> {
    const body = {
      processInstanceId, // 流程实例id
      taskKey, // 节点唯一标识
      userIds, // 减签人员id

    }
    await this.client.post('/flow/process/task/pre-reduce-sign', body)
  }

  /** ID查询文件 */
  public async getFile (id: string): Promise<any> {
    const result = await this.client.get<any>(`/file/file/${id}`)
    return result
  }
  /** ID查询文件(公共表单) */
  public async getPublicFile (id: string): Promise<any> {
    const result = await this.publicClient.get<any>(`/file/public/file/${id}`)
    return result
  }
}

export const processService = new ProcessService()
