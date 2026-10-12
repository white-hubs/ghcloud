import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API, type CubeStatPeriodParams, PeriodStatTypeEnum } from '@ghcloud/cube-protocol'
import { type DateUnit, DateUtils } from '@ghcloud/epp'
import type { AlarmSecurityReportVO, AlarmTypesResponse, PageResult } from './type'

const baseURL = `${BASE_API}/safety-management`

export interface AlarmStatusStat {
  actualNum: number;
  actualRatio: string;
  handlerNum: number;
  progressConfirmedNum: number;
  timeoutNotHandlerNum: number;
  totalNum: number;
  unConfirmedNum: number;
}

export interface AlarmRatioItem {
  id: string;
  name: string;
  totalNum: number;
  actualNum: number;
  actualRatio: string;
}

export interface PropertyFilingData {
  electricVehicleNum: number;
  fireFightingEquipmentNum: number;
  flammableEquipmentNum: number;
  fireFightingEquipmentExpiredNum: number;
  looseWorksNum: number;
}

export interface AlarmStatusStatQuery extends CubeStatPeriodParams {
  tenantID: string;
}

/**
 * 安全管理总部统计服务
 */
export class CubeSafetyManagementStatService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 报警分类 */
  public async alarmTypes (payload?: { keyword?: string | null; }): Promise<AlarmTypesResponse[]> {
    const url = `${baseURL}/alarm-types`
    const resp = await this.gateway.get<LegacyServiceError<AlarmTypesResponse[]>>({
      url,
      payload
    })
    return resp.data||resp
  }

  public async alarmStatusStat (query: AlarmStatusStatQuery): Promise<AlarmStatusStat> {
    const url = `${baseURL}/safety-alarm-statistics/status`
    const resp = await this.gateway.get<LegacyServiceError<AlarmStatusStat>>({
      url,
      payload: {
        period: DateUtils.toTimeBoundaryPeriodOf(query.time, toDateUnit(query.type)).format(),
        marketTenant: query.tenantID ?? '',
        type: query.type
      }
    })
    return resp.data||resp
  }

  public async alarmActualRatioStat (query: AlarmStatusStatQuery): Promise<AlarmRatioItem[]> {
    const url = `${baseURL}/safety-alarm-statistics/model/actual-ratio`
    const resp = await this.gateway.get<LegacyServiceError<AlarmRatioItem[]>>({
      url,
      payload: {
        period: DateUtils.toTimeBoundaryPeriodOf(query.time, toDateUnit(query.type)).format(),
        marketTenant: query.tenantID ?? '',
        type: query.type
      }
    })
    return resp.data||resp
  }

  public async propertyFilingStat (query: AlarmStatusStatQuery): Promise<PropertyFilingData> {
    const url = `${baseURL}/property/propertyFilingStatistics`
    const resp = await this.gateway.get<LegacyServiceError<PropertyFilingData>>({
      url,
      payload: {
        period: DateUtils.toTimeBoundaryPeriodOf(query.time, toDateUnit(query.type)).format(),
        marketTenant: query.tenantID ?? '',
        type: query.type
      }
    })
    return resp.data||resp
  }

  // 安全报告分页查询
  public async getSecurityReportPage (payload: {
    keyword?: string;
    pageNumber: number;
    pageSize: number;
  }): Promise<PageResult<AlarmSecurityReportVO>> {
    const url = `${baseURL}/alarm/securityReportPage`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<AlarmSecurityReportVO>>>({
      url,
      payload
    })
    return resp.data||resp
  }
}

function toDateUnit (type: PeriodStatTypeEnum): DateUnit {
  switch (type) {
    case PeriodStatTypeEnum.TODAY:
      return 'day'
    case PeriodStatTypeEnum.THIS_WEEK:
      return 'week'
    case PeriodStatTypeEnum.THIS_MONTH:
      return 'month'
    case PeriodStatTypeEnum.THIS_YEAR:
      return 'year'
    default:
      throw new Error(`unknown type ${type}`)
  }
}
