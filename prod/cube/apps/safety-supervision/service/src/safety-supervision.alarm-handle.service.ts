import { type CubeAuth, CubeGateway } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import { calculateQoqTime } from './utils'

const baseURL = `${BASE_API}/safety-management`
/** 指标枚举 */
export enum MetricEnum {
  /** 报警超时 */
  ALARM_TIMEOUT = 'safety_management-alarm-timeout_distribution',
  /** 报警状态 */
  ALARM_STATUS = 'safety_management-alarm-status_distribution',
}
export enum ApplicationCode {
  /** 电气管理 */
  ELECTRICAL = 'ELECTRICMANAGE',
  /** 用气管理 */
  GAS = 'GAS_MANAGEMENT',
  /** 安防监控 */
  MONITORING = 'SECURITY_MONITORING',
  /** 消防管理 */
  FIRE = 'FIRECONTROL',
  /** 安全管理 */
  SAFETY = 'SAFETY_MANAGE_HEAD',
  /** 机房动环 */
  ROTATING = 'ROTATINGMANAGE'
}
interface Metric<T> {
  'metric': MetricEnum;
  'description': string;
  'result': T;
  'successful': boolean;
}
/** 保留两位小数 */
const round = (num: number): number => {
  return Number(num.toString().match(/^\d+(?:\.\d{0,2})?/))
}

/** 安全监管 报警处理相关 服务 */
export class CubeSafetySupervisionAlarmHandleService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 报警处理-超时指标 */
  public async getAlarmHandleTimeOutMetric (params: {
    /** 应用code */
    applicationCodes?: ApplicationCode[];
    /** 时间范围 */
    createdPeriod: string;
    /** 市场code */
    marketTenantIDs?: string[];
  }): Promise<Metric< {
      total: number;
      timeout: number;
      timeoutConfigEnabled: number;
    }>> {
    const requestParams = {
      metric: MetricEnum.ALARM_TIMEOUT,
      payload: JSON.stringify({
        applicationCodes: params.applicationCodes,
        createdPeriod: params.createdPeriod,
        marketTenantIDs: params?.marketTenantIDs ?? []
      })
    }
    const resp = await this.gateway.get<Metric< {
      total: number;
      timeout: number;
      timeoutConfigEnabled: number;
    }>>({ url: `${baseURL}/metric`, payload: requestParams })
    return resp
  }

  /** 报警处理-超时率及环比 */
  public async getAlarmHandleTimeOutRate (params: {
    /** 应用code */
    applicationCodes?: ApplicationCode[];
    /** 时间范围 */
    createdPeriod: string;
    /** 市场code */
    marketTenantIDs?: string[];
  }): Promise<{
      rate: number;
      qoq: number;
    }> {
    /** 本期数据 */
    const current = await this.getAlarmHandleTimeOutMetric(params)
    /** 上期数据 */
    const lastPeriod = await this.getAlarmHandleTimeOutMetric({ ...params, createdPeriod: calculateQoqTime(params.createdPeriod.split(',')).join(',') })
    /** 比率 */
    const rate = current.result.timeout / current.result.timeoutConfigEnabled * 100
    // 计算环比
    const qoq = (current.result.timeout - lastPeriod.result.timeout) * 100 / lastPeriod.result.timeout
    return {
      rate: round(rate),
      qoq: round(qoq)
    }
  }

  /** 报警处理-状态指标 */
  public async getAlarmHandleStatusMetric (params: {
    /** 应用code */
    applicationCodes?: ApplicationCode[];
    /** 时间范围 */
    createdPeriod: string;
    /** 市场code */
    marketTenantIDs?: string[];
  }): Promise<Metric< {
      'ALARM_UN_CONFIRMED': number;
      'ALARM_HANDLER': number;
      'ALARM_PROGRESS_CONFIRMED': number;
      'ALARM_SUSPEND': number;
    }>> {
    const requestParams = {
      metric: MetricEnum.ALARM_STATUS,
      payload: JSON.stringify({
        applicationCodes: params.applicationCodes,
        createdPeriod: params.createdPeriod,
        marketTenantIDs: params.marketTenantIDs ?? []
      })
    }
    const resp = await this.gateway.get<Metric<{
      'ALARM_UN_CONFIRMED': number;
      'ALARM_HANDLER': number;
      'ALARM_PROGRESS_CONFIRMED': number;
      'ALARM_SUSPEND': number;
    }>>({ url: `${baseURL}/metric`, payload: requestParams })
    resp.result.ALARM_HANDLER = resp.result.ALARM_HANDLER ?? 0
    resp.result.ALARM_UN_CONFIRMED = resp.result.ALARM_UN_CONFIRMED ?? 0
    resp.result.ALARM_PROGRESS_CONFIRMED = resp.result.ALARM_PROGRESS_CONFIRMED ?? 0
    resp.result.ALARM_SUSPEND = resp.result.ALARM_SUSPEND ?? 0
    return resp
  }

  /** 报警处理-处理率及环比 */
  public async getAlarmHandlerRate (params: {
    /** 应用code */
    applicationCodes?: ApplicationCode[];
    /** 时间范围 */
    createdPeriod: string;
    /** 市场code */
    marketTenantIDs?: string[];
  }): Promise<{
      rate: number;
      qoq: number;
    }> {
    /** 本期数据 */
    const current = await this.getAlarmHandleStatusMetric(params)
    const currentTotal = current.result.ALARM_HANDLER + current.result.ALARM_UN_CONFIRMED + current.result.ALARM_PROGRESS_CONFIRMED
    /** 上期数据 */
    const lastPeriod = await this.getAlarmHandleStatusMetric({ ...params, createdPeriod: calculateQoqTime(params.createdPeriod.split(',')).join(',') })
    /** 比率 */
    const rate = current.result.ALARM_HANDLER / currentTotal * 100

    // 计算环比
    const qoq = (current.result.ALARM_HANDLER - lastPeriod.result.ALARM_HANDLER) * 100 / lastPeriod.result.ALARM_HANDLER
    return {
      rate: round(rate),
      qoq: round(qoq)
    }
  }

  /** 报警处理-响应率及环比 */
  public async getAlarmHandleResponseRate (params: {
    /** 应用code */
    applicationCodes?: ApplicationCode[];
    /** 时间范围 */
    createdPeriod: string;
    /** 市场code */
    marketTenantIDs?: string[];
  }): Promise<{
      rate: number;
      qoq: number;
    }> {
    /** 本期数据 */
    const current = await this.getAlarmHandleStatusMetric(params)
    const currentTotal = current.result.ALARM_HANDLER + current.result.ALARM_UN_CONFIRMED + current.result.ALARM_PROGRESS_CONFIRMED
    const currentResponseNum = current.result.ALARM_HANDLER + current.result.ALARM_PROGRESS_CONFIRMED
    /** 上期数据 */
    const lastPeriod = await this.getAlarmHandleStatusMetric({ ...params, createdPeriod: calculateQoqTime(params.createdPeriod.split(',')).join(',') })
    const lastPeriodResponseNum = lastPeriod.result.ALARM_HANDLER + lastPeriod.result.ALARM_PROGRESS_CONFIRMED

    /** 比率 */
    const rate = currentResponseNum / currentTotal * 100
    // 计算环比
    const qoq = (currentResponseNum - lastPeriodResponseNum) * 100 / lastPeriodResponseNum
    return {
      rate: round(rate),
      qoq: round(qoq)
    }
  }

  /** 报警处理—市场排名 */
  public async getMarketRankByMetric (params: {
    metric: 'response' | 'timeout' | 'handled';
    /** 应用code */
    applicationCodes?: ApplicationCode[];
    /** 时间范围 */
    createdPeriod: string;
    marketTenantIDs: string[];
  }): Promise<{
      marketName: string;
      marketTenantID: string;
      rate: number;
    }[]> {
    const requestParams = {
      payload: {
        createdPeriod: params.createdPeriod,
        applicationCodes: params.applicationCodes,
        marketTenantIDs: params.marketTenantIDs
      },
      metric: ''
    }
    switch (params.metric) {
      case 'response':
        requestParams.metric = 'safety_management-alarm-response_rate_group_by_market'
        break
      case 'handled':
        requestParams.metric = 'safety_management-alarm-handled_rate_group_by_market'
        break
      case 'timeout':
        requestParams.metric = 'safety_management-alarm-timeout_rate_group_by_market'
        break
    }

    let [{ result }] = await this.gateway.create<[Metric< {
      marketName: string;
      marketTenantID: string;
      rate: number;
    }[]>]>({ url: `${baseURL}/metric/batch-get`, payload: [requestParams] })
    result = result.map(e => {
      return {
        ...e,
        rate: e.rate * 100
      }
    })
    result.sort((a, b) => b.rate - a.rate)
    return result
  }
}
