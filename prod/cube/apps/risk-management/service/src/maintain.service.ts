import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'

const baseURL = `${BASE_API}/maintain`

export interface InspectPointList {
  pages: number;
  records: RootObject[];
  total: number;
}
export interface FaultListType {
  formInstanceId: string;
  processInstanceId: string;
  status: string;
  startUserInfo: {
    organizationName: string;
  };
  currentTaskId: string;
  submitedTime: number;
  instanceName: string;
  businessType: string;
  objName: string;
  hiddenObjName: string;
  result: string;
}
export interface TaskDetailType {
  [key: string]: string | string[];
  targetId: string;
  id: string;
  targetName: string;
  taskName: string;
  executeData: string;
  organizationName: string;
  areaName: string;
  time: string;
  result: string;
  completeDate: string;
  userName: string;
  patrolLocationNum: string;
  completedNum: string;
  undoneNum: string;
  untowardLocationNum: string;
  normalLocationNum: string;
  executePeriod: string[];

}
export interface ElectronTaskType {
  id: string;
  patrolResult: string;
  locationName: string;
  arae: [];
  patrolDate: string;
}
export interface ElectronicPatrols {
  formInstanceId: string;
  undoneNum: string;
  completedNum: string;
  completeDate: string;
  patrolLocationNum: string;
  userName: string;
  taskName: string;
  id: string;
}

/**
* RiskSourceLedgerVO，查询结果
*/
export interface RootObject {
  id: string;
  codeNum: string;
  name: string;
  typeName: string;
  typeId: string;
  depName: string;
  depId: string;
  areaId: string;
  areaName: string;
  detailAddress: string;
  location: string;
}

export class CubeMaintainService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  // 分页查询现场点列表
  public async inspectPointList (payload: {
    pageNumber: number;
    pageSize: number;
  }): Promise<InspectPointList> {
    const url = `${baseURL}/inspect/pointList`
    const resp = await this.gateway.get<LegacyServiceError<InspectPointList>>({ url, payload })
    return resp.data || resp
  }

  /**
 * @说明 故障单列表
 * @returns
 */
  public async faultApplyPersonal (payload: {
    pageNumber: number;
    pageSize: number;
    businessType: string;
  }): Promise<{ page: string; records: FaultListType[]; total: number; }> {
    const url = `${baseURL}/fault/apply/personal`
    const resp = await this.gateway.get<LegacyServiceError<{ page: string; records: FaultListType[]; total: number; }>>({ url, payload })
    return resp.data || resp
  }

  // 获取故障报修工单
  public async getFlowProcessPage (payload: {
    pageNumber: number;
    pageSize: number;
    businessType: string;
    type?: string;
    status?: string;
    processInstanceIds: string;
  }): Promise<{ page: string; records: FaultListType[]; total: number; }> {
    const url = `${baseURL}/fault/apply/all`
    const resp = await this.gateway.get<LegacyServiceError<{ page: string; records: FaultListType[]; total: number; }>>({ url, payload })
    return resp.data || resp
  }

  // 获取隐患排查工单
  public async getHiddenPage (payload: {
    pageNumber: number;
    pageSize: number;
    businessType: string;
    type?: string;
    status?: string;
    hiddenObjId?: string;
    processInstanceIds: string;
  }): Promise<{ page: string; records: FaultListType[]; total: number; }> {
    const url = `${baseURL}/hidden/apply/all`
    const resp = await this.gateway.get<LegacyServiceError<{ page: string; records: FaultListType[]; total: number; }>>({ url, payload })
    return resp.data || resp
  }

  // 巡更记录分页查询
  public async getElectronicPatrolsPage (payload: {
    pageNumber: number;
    pageSize: number;
    keyword: string;
    period: string;
  }): Promise<{ page: string; records: ElectronicPatrols[]; total: number; }> {
    const url = `${baseURL}/electron/task/queryRecordPage`
    const resp = await this.gateway.get<LegacyServiceError<{ page: string; records: ElectronicPatrols[]; total: number; }>>({ url, payload })
    return resp.data || resp
  }

  // 通过ID查询巡更记录
  public async getElectronTaskById (payload: {
    id: string;
  }): Promise<TaskDetailType> {
    const url = `${baseURL}/electron/task/${payload.id}`
    const resp = await this.gateway.get<TaskDetailType>({ url, payload })
    return resp
  }

  // 任务时段的路线
  public async getElectronTaskLocation (payload: {
    taskId: string;
    executePeriod: string;
  }): Promise<ElectronTaskType[]> {
    const url = `${baseURL}/electron/task/location`
    const resp = await this.gateway.get<ElectronTaskType[]>({ url, payload })
    return resp
  }
}
