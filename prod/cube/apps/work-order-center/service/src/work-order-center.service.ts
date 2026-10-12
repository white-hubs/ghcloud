import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'

const baseURL = `${BASE_API}/flow`

export interface WorkOrderStatisticsModel {
  //类型编码
  businessType: string;
  //工单类型
  businessTypeName: string;
  //总数
  totalNumber: number;
  //处理中工单数
  processNumber: number;
  //驳回工单数
  rejectNumber: number;
  //撤销工单数
  undoNumber: number;
  //已处理工单数
  dealNumber: number;
}
export interface RowState {
  formNo: string;
  processInstanceId: string;
  startUserId: string;
  formInstanceId: number | null;
  startUserName: string;
  submitedTime: number;
  lastTaskCompletedTime: string | null;
  status: string;
  activeNodeName: string;
  currentTaskId: string;
  businessType: string;
}
export interface WorkOrderBusinessTypeModel {
  //类型编码
  code: string;
  //工单类型
  name: string;
}

export class CubeWorkOrderCenterService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  // 获取工单统计列表
  public async getWorkOrderStatisticsList (payload: {
    pageNumber: number;
    pageSize: number;
    applicationCode?: string | undefined;
    businessType?: string | undefined;
    keyword?: string | undefined;
    organizationId?: string | undefined;
    userIds?: string | undefined;
    period?: string | undefined;
  }): Promise<{ total: number; records: WorkOrderStatisticsModel[]; pages: number; }> {
    const url = `${baseURL}/statistics/group/businessType`
    const resp = await this.gateway.get<{ total: number; records: WorkOrderStatisticsModel[]; pages: number; }>({ url, payload })
    return resp
  }
 // 获取工单列表
  public async getWorkOrderList (payload: {
     businessType?: string | undefined;
     organizationId?: string | undefined;
     submitTime?: string;
     pageNumber: number;
     pageSize: number;
     username?: string;
     applicationCode?: string;
  }): Promise<{ total: number; records: RowState[]; pages: number; }> {
    const url = `${baseURL}/process/instance/historical/allPage`
    const resp = await this.gateway.get<LegacyServiceError<{total: number; records: RowState[]; pages: number;} > >({ url, payload })
    return resp.data || resp
  } 
  // 批量删除工单列表
  public async deleteWorkOrder (payload: string[]): Promise<boolean> {
    const url = `${baseURL}/form/instance/form-flows/delete`
    const resp = await this.gateway.create<boolean>({ url, payload })
    return resp
  }
  // 导出工单统计列表
  public async exportWorkOrderStatisticsList (payload: {
    applicationCode?: string | undefined;
    businessType?: string | undefined;
    keyword?: string | undefined;
    organizationId?: string | undefined;
    userIds?: string | undefined;
    period?: string | undefined;
  }): Promise<Blob> {
    const url = `${baseURL}/statistics/group/businessType/export`
    const resp = await this.gateway.customBlob({
      url,
      method: 'GET',
      payload
    })
    return resp
  }

  // 获取工单类型列表
  public async getWorkOrderBusinessTypeList (): Promise<WorkOrderBusinessTypeModel[]> {
    const url = `${baseURL}/form-business/type/list`
    const resp = await this.gateway.get<LegacyServiceError<WorkOrderBusinessTypeModel[]>>({ url })
    return resp.data||resp
  }

}
