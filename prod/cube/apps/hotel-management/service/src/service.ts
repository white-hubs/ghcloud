import { type CubeAuth, CubeGateway, LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import { PageResult, HotelFlowProcessVO } from './types'

const baseURL = `${BASE_API}`

export class CubeHotelManagementService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 酒店审批记录 */
  public async getHotelApprovalRecord (payload: {
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
  }): Promise<PageResult<HotelFlowProcessVO>> {
    const url = `${baseURL}/third-party/hotel-reservation/approval/approval-record`
    const res = await this.gateway.get<PageResult<HotelFlowProcessVO>>({ url, payload })
    return res
  }

  /** 发起酒店审批 */
  public async hotelApprovalSubmit (payload: {
    application?: null | string;
    applicationName?: null | string;
    approveUsers?: Record<string, unknown>;
    backLogTitle?: null | string;
    businessType?: null | string;
    businessTypeName?: null | string;
    data?: null | string;
    flowKey?: null | string;
    formDefinitionId?: string | number | null;
    formDefinitionVersion?: number | null;
    formKey?: null | string;
    formNo?: null | string;
    formNoPrefix?: null | string;
    id?: number | null;
    name?: null | string;
    type?: null | string;
    variable?: Record<string, unknown>;
    variables?: Record<string, unknown>;
  }): Promise<unknown> {
    const url = `${baseURL}/third-party/hotel-reservation/approval/submit`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp.data||resp
  }
}
