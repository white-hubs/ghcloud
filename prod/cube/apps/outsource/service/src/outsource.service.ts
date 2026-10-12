import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { PageResult, RepairModeModel, RepairCompanyModel, RepairDeviceModel, RepairTrafficModel, RepairChannelModel } from './types'

const baseURL = `${BASE_API}/maintain`

export class CubeOutsourceService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }


  //个人委外报修工单列表
  public async repairList (payload: {
    pageNumber: number;
    pageSize: number;
    businessType: string;
    submitTime: string;
  }): Promise<{}> {
    const url = `${baseURL}/outsource/apply/personal`
    const resp = await this.gateway.get<LegacyServiceError<{}>>({ url, payload })
    return resp.data || resp
  }

  //委外设备导入
  public async importDevice (payload: {
    deviceInstanceIds: string[];
  }): Promise<{}> {
    const url = `${baseURL}/outsource/device/import`
    const resp = await this.gateway.create<LegacyServiceError<{}>>({ url, payload })
    return resp.data || resp
  }

  //提交委外维修申请单
  public async repairListAdd (payload: {
    deviceInstanceId: string;
    faultTime: string;
    repairReason: string;
    imageIdList: string[];
  }): Promise<{}> {
    const url = `${baseURL}/outsource/repair/application/receipt`
    const resp = await this.gateway.create<LegacyServiceError<{}>>({ url, payload })
    return resp.data || resp
  }

  //获取委外维修申请单详情
  public async repairListId (payload: {
    id: string;
  }): Promise<{}> {
    const url = `${baseURL}/outsource/repair/application/receipt/${payload.id}`
    const resp = await this.gateway.get<LegacyServiceError<{}>>({ url, payload })
    return resp.data || resp
  }

  //维修工单流程
  public async repairListPro (payload: {
    receiptId: string;
  }): Promise<{}> {
    const url = `${baseURL}/retrofit/receipt/event-line`
    const resp = await this.gateway.get<LegacyServiceError<{}>>({ url, payload })
    return resp.data || resp
  }

  //委外维修工单
  public async repairOrderList (payload: {
    ticketStatus: string | null;
    outsourceCompanyId: string | null;
    period: string | null;
    name: string | null;
  }): Promise<{}> {
    const url = `${baseURL}/outsource/repair/ticket/page`
    const resp = await this.gateway.get<LegacyServiceError<{}>>({ url, payload })
    return resp.data || resp
  }

  //委外维修工单详情
  public async repairOrderId (payload: {
    id: string;
  }): Promise<{}> {
    const url = `${baseURL}/outsource/repair/ticket/${payload.id}`
    const resp = await this.gateway.get<LegacyServiceError<{}>>({ url, payload })
    return resp.data || resp
  }

  /**
   * 委外模式列表
   */
  public async repairMode (): Promise<RepairModeModel[]> {
    const url = `${baseURL}/outsource/model/list`
    const resp = await this.gateway.get<LegacyServiceError<RepairModeModel[]>>({ url })
    return resp.data || resp
  }

  /**
   * 新增委外模式
   */
  public async repairModeAdd (payload: {
    name: string;
  }): Promise<void> {
    const url = `${baseURL}/outsource/model`
    const resp = await this.gateway.create<void>({ url, payload })
    return  resp
  }

  /**
   * 编辑委外模式
   */
  public async repairModeEdit (payload: {
    id: string;
    name: string;
  }): Promise<void> {
    const url = `${baseURL}/outsource/model`
    const resp = await this.gateway.update<void>({ url, payload })
    return  resp
  }

  /**
   * 删除委外模式
   */
  public async repairModeDelete (id: string): Promise<void> {
    const url = `${baseURL}/outsource/model/${id}`
    return await this.gateway.delete({ url })
  }

  /**
   * 委外公司
   */
  public async repairCompany (payload?: {
    id: string;
  }): Promise<RepairCompanyModel[]> {
    const url = `${baseURL}/outsource/company/list`
    const response = await this.gateway.get<LegacyServiceError<RepairCompanyModel[]>>({ url, payload })
    return response.data || response
  }

  /**
   * 委外公司详情
   */
  public async repairCompanyDetails (id: string): Promise<RepairCompanyModel[]> {
    const url = `${baseURL}/outsource/company/${id}`
    const response = await this.gateway.get<LegacyServiceError<RepairCompanyModel[]>>({ url })
    return response.data || response
  }

  /**
   * 新增委外公司
   */
  public async repairCompanyAdd (payload: {
    name: string;
    outsourceModelIdList: string[];
    outsourceScopeIdList: string[];
    responsiblePerson: string;
    responsiblePersonPhone: string;
  }): Promise<void> {
    const url = `${baseURL}/outsource/company`
    const response = await this.gateway.create<void>({ url, payload })
    return response
  }

  /**
   * 编辑委外公司
   */
  public async repairCompanyEdit (payload: {
    id: string;
    name: string;
    outsourceModelIdList: string[];
    outsourceScopeIdList: string[];
    responsiblePerson: string;
    responsiblePersonPhone: string;
  }): Promise<void> {
    const url = `${baseURL}/outsource/company/change`
    const response = await this.gateway.update<void>({ url, payload })
    return  response
  }

  /**
   * 删除委外公司
   */
  public async repairCompanyDelete (id: string): Promise<void> {
    const url = `${baseURL}/outsource/company/${id}`
    return await this.gateway.delete({ url })
  }

  /**
   * 委外设备
   */
  public async repairDevice (payload?: {
    pageNumber: number;
    pageSize: number;
    keyword: string | null;
  }): Promise<PageResult<RepairDeviceModel>> {
    const url = `${baseURL}/outsource/device/list`
    const response = await this.gateway.get<LegacyServiceError<PageResult<RepairDeviceModel>>>({ url, payload })
    return response.data || response
  }

  /**
   * 委外设备-移除
   */
  public async repairDeviceRemove (id: string): Promise<void> {
    const url = `${baseURL}/outsource/device/instance/${id}`
    return await this.gateway.delete({ url })
  }

  /**
   * 委外设备-批量移除
   */
  public async repairDeviceBatchRemove (payload: {
    deviceInstanceIds: string[];
  }): Promise<void> {
    const url = `${baseURL}/outsource/device/batchRemove`
    return await this.gateway.delete({ url, payload })
  }

  /**
   * 委外-保存业务配置
   */
  public async repairCollocateConfirm (payload: {
    channelTypes: string[];
    configs: {
      mgmtType: string;
      mgmtValues: string[];
    }[];
    deDuplicationConfig: {
      deDuplicationPeriod: number | null;
      duration: number | null;
      switchSetting: boolean;
    };
  }): Promise<void> {
    const url = `${baseURL}/outsource/receipt/collocate-confirm-user`
    const response = await this.gateway.create<void>({ url, payload })
    return response
  }

  /**
   * 委外-获取确认用户配置
   */
  public async repairUserConfig (): Promise<RepairTrafficModel> {
    const url = `${baseURL}/outsource/receipt/confirm-user`
    const response = await this.gateway.get<LegacyServiceError<RepairTrafficModel>>({ url })
    return response.data || response
  }

  /**
   * 委外-通知方式枚举
   */
  public async repairNotifyChannels (): Promise<RepairChannelModel[]> {
    const url = `${baseURL}/outsource/receipt/confirm-user/notify-channels`
    const response = await this.gateway.get<LegacyServiceError<RepairChannelModel[]>>({ url })
    return response.data || response
  }

}
