import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import { HandoverRecordDetailVO, HandoverRecordVO, TodoHomePageVO, WorkTaskPageVO } from './type'

const baseURL = `${BASE_API}/workCenter`

export interface TodoTaskTag {
  businessType: string;
  businessTypeName: string;
  total: number;
}
export interface TodoTaskTrend {
  total: number; period: string;
}

export interface TodoTaskType {
  code: string; name: string;
}

export interface TaskRecord {
  applicationCode: string;
  applicationName: string;
  businessKey: string;
  businessPrincipal: string;
  businessStatus: string;
  businessStatusName: string;
  businessType: string;
  businessTypeName: string;
  handlerTime: null | number;
  id: string;
  nextBusinessStatus: string;
  nextBusinessStatusName: string;
  status: string;
  taskDelState: boolean;
  taskName: string;
  taskTime: number;
  url: string;
}

export class CubeWorkCenterService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 待办任务类型 */
  public async getTodoTaskType (): Promise<TodoTaskType[]> {
    const url = `${baseURL}/work-task-tags`
    const resp = await this.gateway.get<LegacyServiceError<TodoTaskType[]>>({ url })
    return resp.data||resp
  }

  /** 已办任务类型 */
  public async getDoneTaskType (): Promise<TodoTaskType[]> {
    const url = `${baseURL}/work-done-task-tags`
    const resp = await this.gateway.get<LegacyServiceError<TodoTaskType[]>>({ url })
    return resp.data||resp
  }

  /** 已办任务分页 */
  public async getDoneTaskPage (payload: {
    pageNumber: number;
    pageSize: number;
    todoTagCode?: string | undefined;
    period?: string | undefined;
    keyword?: string | undefined;
  }): Promise<{ total: number; records: TaskRecord[];pages: number; }> {
    const url = `${baseURL}/work-tasks-done`
    const resp = await this.gateway.get<LegacyServiceError<{ total: number; records: TaskRecord[];pages: number; }>>({ url, payload })
    return resp.data||resp
  }

  public async postProcessTaskComplete (payload: {
    taskId: string;
  }): Promise<unknown> {
    const url = '/api/flow/process/task/complete'
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data||resp
  }

  /** 工作中心-任务分页 */
  public async getWorkTaskPage (payload: {
    pageNumber: number;
    pageSize: number;
    period?: string | undefined;
    keyword?: string | undefined;
    businessType?: string| undefined;
    businessTypes?: string[];
    createBy?: string| undefined;
    status?: string| undefined;
    todoTagCode?: string| undefined;
    todoTagCodes?: string[]| undefined;
    handover?: boolean| undefined;
    taskStatus?: string| undefined;
  }): Promise<{ total: number; records: WorkTaskPageVO[];pages: number; }> {
    const url = `${baseURL}/work/center/task/query`
    const resp = await this.gateway.get<LegacyServiceError<{ total: number; records: WorkTaskPageVO[];pages: number; }>>({ url, payload })
    return resp?.data || resp
  }

  /** 交接班记录分页 */
  public async getHandoverPage (payload: {
    pageNumber: number;
    pageSize: number;
    period?: string | undefined;
    keyword?: string | undefined;
    status?: string| undefined;
    permission?: boolean| undefined;
  }): Promise<{ total: number; records: HandoverRecordVO[];pages: number; }> {
    const url = `${baseURL}/handover/record/list`
    const resp = await this.gateway.get<LegacyServiceError<{ total: number; records: HandoverRecordVO[];pages: number; }>>({ url, payload })
    return resp?.data || resp
  }
  /** 交接班记录详情 */
  public async getHandoverDetail (payload: {
    id: string | number;
  }): Promise<HandoverRecordDetailVO> {
    const url = `${baseURL}/handover/record/detail`
    const resp = await this.gateway.get<LegacyServiceError<HandoverRecordDetailVO>>({ url, payload })
    return resp?.data || resp
  }

  /** 接班 */
  public async takeover (payload: {
    id?: string;
    takeSignFileId?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/handover/record/takeover`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }
  /** 交班 */
  public async handoverAdd (payload: {
    fileIds?: (string | number)[];
    handoverTaskList?: (string|number)[];
    remarks?: string;
    shiftSignFileId?: string | number;
    takeOverUser?: string | number;
  }): Promise<unknown> {
    const url = `${baseURL}/handover/record/add`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data || resp
  }
  /** 撤销 */
  public async handoverCancel (payload: {
    id: string | number;
  }): Promise<void> {
    const url = `${baseURL}/handover/record/cancel/${payload?.id}`
    await this.gateway.delete({ url })
  }
  /** 工作中心-任务总览 */
  public async getHomePageNum (payload: {
    period?: string | undefined;
  }): Promise<TodoHomePageVO> {
    const url = `${baseURL}/work/center/home/page/num`
    const resp = await this.gateway.get<LegacyServiceError<TodoHomePageVO>>({ url, payload })
    return resp?.data || resp
  }

}
