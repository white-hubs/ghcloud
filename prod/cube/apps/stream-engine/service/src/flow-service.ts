import { type CubeAuth, CubeGateway } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { FlowProcessVO, FormFlowInstance, UserLastSign, FormFlowStatVO, FlowApplication } from './type'

const baseURL = `${BASE_API}/flow`

export class CubeFlowService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }
  /**
  * 个人发起工单统计
  */
  public async getFlowProcessStatList (payload: Record<string, any>): Promise<{ records: FormFlowStatVO[]; total: number;pages: number; }> {
    const url = `${baseURL}/getWordOrderStatisticsByUser`
    const resp = await this.gateway.get<{ records: FormFlowStatVO[]; total: number;pages: number; }>({ url, payload })
    return resp
  }
  /** 审批通过 */
  public async taskComplete (payload: Record<string, any>): Promise<FormFlowInstance> {
    const url = `${baseURL}/process/task/complete`
    const resp = await this.gateway.create<FormFlowInstance>({ url, payload })
    return resp
  }
  /** taskId查询表单任务 */
  public async getTaskForm (formInstanceId: string): Promise<FormFlowInstance> {
    const url = `${baseURL}/process/task/form/id/${formInstanceId}`
    const resp = await this.gateway.get<FormFlowInstance>({ url })
    return resp
  }
  public async postFormFlowsFirst (payload: Record<string, any>): Promise<FormFlowInstance> {
    const url = `${baseURL}/form-flows/first/submit`
    const resp = await this.gateway.create<FormFlowInstance>({ url, payload })
    return resp
  }
  /** 判断当前流程是否处于第一个审批节点 */
  public async firstTaskActive (processInstanceId: string): Promise<FormFlowInstance> {
    const url = `${baseURL}/flow/${processInstanceId}/first/task/active`
    const resp = await this.gateway.get<FormFlowInstance>({ url })
    return resp
  }
  /** 拒绝审批 */
  public async postProcessTaskReject (payload: Record<string, any>): Promise<FormFlowInstance> {
    const url = `${baseURL}/process/task/reject`
    const resp = await this.gateway.create<FormFlowInstance>({ url, payload })
    return resp
  };
  /** 撤销审批 */
  public async postProcessTaskUndo (payload: Record<string, any>): Promise<FormFlowInstance> {
    const url = `${baseURL}/process/task/undo`
    const resp = await this.gateway.create<FormFlowInstance>({ url, payload })
    return resp
  };
  /** 回退审批 */
  public async postProcessTaskBack (payload: Record<string, any>): Promise<FormFlowInstance> {
    const url = `${baseURL}/process/task/back`
    const resp = await this.gateway.create<FormFlowInstance>({ url, payload })
    return resp
  };
  /**  获取上一个签名*/
  public async getLastWriteSign (): Promise<UserLastSign>{
    const url = `${baseURL}/process/task/user-last-sign`
    const resp = await this.gateway.create<UserLastSign>({ url })
    return resp
  }

  /** 获取审批列表 */
  public async getFlowProcessPage (payload: {
    applicationCode?: string;
    businessType?: string;
    organizationId?: number;
    pageNumber: number;
    pageSize: number;
    processInstanceIds?: string;
    processInstanceIdsList?: string[];
    startUserId?: string;
    status?: string;
    submitTime?: string;
    type?: string;
    username?: string;
  }): Promise<{ records: FlowProcessVO[]; total: number;pages: number; }> {
    const url = `${baseURL}/process/instance/historical/page`
    const resp = await this.gateway.get<{ records: FlowProcessVO[]; total: number;pages: number; }>({ url, payload })
    return resp
  }
  /** 获取流程应用列表 */
  public async getFlowApplicationList (): Promise<FlowApplication[]> {
    const url = `${baseURL}/form-flow/application/list`
    const resp = await this.gateway.get<FlowApplication[]>({ url })
    return resp
  }
}
