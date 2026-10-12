import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'

const baseURL = `${BASE_API}/energymanagement`

export interface EnergyTypeStat {
  total: number;
  list: unknown[];
}

export interface EnergyTypeTimeStat {
  time: string;
  value: number;
}

export type EnergyAreaStat = EnergyTypeStat

export interface EnergyTypeStatQuery {
  instrumentType: string;
  timeFlag: string;
}

export type EnergyAreaStatQuery = EnergyTypeStatQuery

export class CubeEnergyStatService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /**
   * 分项能耗统计
   */
  public async getEnergyStatByType (query: EnergyTypeStatQuery): Promise<EnergyTypeStat> {
    const url = `${baseURL}/energy-project`
    const resp = await this.gateway.get<LegacyServiceError<EnergyTypeStat>>({ url, payload: { ...query } })
    return resp.data||resp
  }

  /**
   * 碳排/综合趋势统计（按时间）
   */
  public async getStatTrend (payload: {
    type?: string;
    instrumentType?: string;
    period?: string;
  }): Promise<EnergyTypeTimeStat[]> {
    const url = `${baseURL}/energy-daily-usage/dc/stat/trend`
    const resp = await this.gateway.get<LegacyServiceError<EnergyTypeTimeStat[]>>({ url, payload })
    return resp.data||resp
  }

  /**
   * 分区/分项汇总统计
   */
  public async getEnergyStatProjectSingle (payload: {
    projectCategory: string;
    period: string;
    instrumentType: string;
  }): Promise<EnergyAreaStat> {
    const url = `${baseURL}/energy-daily-usage/stat/project/single`
    const resp = await this.gateway.get<LegacyServiceError<EnergyAreaStat>>({ url, payload })
    return resp.data||resp
  }

  // 能耗分项占比统计
  public async getEnergyStatProject (payload: {
    projectCategory: string;
    period: string;
    instrumentType: string;
  }): Promise<EnergyAreaStat> {
    const url = `${baseURL}/energy-daily-usage/project/stat/category`
    const resp = await this.gateway.get<LegacyServiceError<EnergyAreaStat>>({ url, payload })
    return resp.data||resp
  }

  /**
   * 分类环比
   */
  public async getSummaryStat (payload: {
    instrumentType?: string;
    period?: string;
    timeType?: string;
  }): Promise<Record<string, unknown>> {
    const url = `${baseURL}/energy-daily-usage/stat/type/ringRatio`
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>>>({ url, payload })
    return resp.data||resp
  }

  /**
 *
 * 能耗分类配置分页查询
 */
  public async ClassifySettingsPage (): Promise<Record<string, unknown>> {
    const url = `${baseURL}/energy-collect-config/page`
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>>>({ url })
    return resp.data||resp
  }
}
