import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'

const baseURL = `${BASE_API}`

export class CubeDeviceAlarmService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 报警列表- 分页 */
  public async getAlarmRecordsPage (params: {
    tenant?: string | undefined;
    alarmEvent?: string;
    alarmEventTypeId?: string;
    alarmHandlerResult?: string;
    alarmHandlerTimeoutStatus?: string;
    alarmLevelCode?: string;
    alarmLevelId?: number;
    alarmStatus?: string;
    alarmTargetTypeId?: number;
    alarmTypeId?: number;
    applicationCode?: string;
    areaId?: string;
    areaIds?: string;
    businessType?: string;
    departmentId?: string;
    deviceIds?: string[];
    deviceTags?: string;
    keyword?: string;
    period?: string;
    sceneType?: string;
    userId?: string;
    userResponsible?: string;
    pageNumber?: string | number;
    pageSize?: string | number;
  }): Promise<{ records: unknown[]; total: number; }> {
    const url = `${baseURL}/alarm/alarm-records/queryPageByTenant`
    const headers = params.tenant ? { headers: { tenant: params.tenant } } : {}
    const resp = await this.gateway.custom<LegacyServiceError<{ records: unknown[]; total: number; }>>({
      url,
      query: params,
      method: 'GET',
      ...headers
    })
    return resp.data || resp
  }

  /** 报警 详情 */
  public async getAlarmRecordDetail (id: string): Promise<unknown> {
    const url = `${baseURL}/alarm/alarm-record/${id}`
    const resp = await this.gateway.get<LegacyServiceError<unknown>>({ url })
    return resp.data || resp
  }
}
