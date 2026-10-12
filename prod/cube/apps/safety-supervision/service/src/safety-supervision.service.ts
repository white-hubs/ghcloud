import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { RiskIndexDetailVO, RiskIndexVO, RiskCountStatusType, MOMRatio, SafetyAnalysisAlarmRatioVO, SafetyAlarmEventTypeRatioVO, SafetyMarketStatisticsCardVO, FilingResponse } from './types'

const baseURL = `${BASE_API}`
const baseURL2 = `${BASE_API}/safety-management`
// const baseURL2 = `${BASE_API}`
/** 安全监管服务 */
export class CubeSafetySupervisionService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 报警记录 分页 */
  public async alarmRecordPage (payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string ;
  }): Promise<{ records: unknown[]; total: number; }> {
    const url = `${baseURL}/safety-management/alarm-record/page`
    const resp = await this.gateway.get<LegacyServiceError<{ records: unknown[]; total: number; }>>({ url, payload })
    return resp.data||resp
  }

  /** 安全风险指数排名 */
  public async riskIndexRank (payload?: {
    marketTenant?: string;
    period?: string;
    type?: string;
  }): Promise<RiskIndexVO[]> {
    const url = `${baseURL2}/riskIndex/list`
    const resp = await this.gateway.get<LegacyServiceError<RiskIndexVO[]>>({ url, payload })
    return resp.data||resp
  }

  /** 风险源建档统计 */
  public async getRiskFilingStatistics (payload?: {
    marketTenant?: string;
    period?: string;
    marketTenants?: string[];
  }): Promise<FilingResponse[]> {
    const url = `${baseURL2}/property/filingAnalyse`
    const resp = await this.gateway.get<LegacyServiceError<FilingResponse[]>>({ url, payload })
    return resp.data||resp
  }

  /** 市场配置列表 */
  public async getMarketList (payload?: {
    keyword?: string;
  }): Promise<unknown[]> {
    const url = `${baseURL}/dataintegrate/market-config/list`
    const resp = await this.gateway.get<LegacyServiceError<unknown[]>>({ url, payload })
    return resp.data||resp
  }

  /** 查询市场安全风险详情 */
  public async riskIndexDetail (payload: {
    marketTenant: string;
    period: string;
  }): Promise<RiskIndexDetailVO> {
    const url = `${baseURL2}/riskIndex/detail`
    const resp = await this.gateway.get<LegacyServiceError<RiskIndexDetailVO>>({ url, payload })
    return resp.data||resp
  }

  /** 安全分析 报警状态环比率统计 */
  public async safetyAnalysisAlarmRatio (payload: {
    applicationCode?: string;
    marketTenant?: string;
    period?: string;
    type?: string;
    alarmTypeCode?: string;
    alarmLevenCode?: string;
    alarmEventTypeCodes?: string[];
  }): Promise<SafetyAnalysisAlarmRatioVO> {
    const url = `${baseURL2}/safety-alarm-statistics/custom-status/chain-ratio`
    const resp = await this.gateway.get<LegacyServiceError<SafetyAnalysisAlarmRatioVO>>({ url, payload })
    return resp.data||resp
  }

  /** 安全分析 模块报警事件占比统计 */
  public async safetyAlarmEventTypeRatio (payload: {
    applicationCode?: string | undefined;
    period?: string;
    type?: string;
    marketTenant?: string;
    marketTenants?: string[];
  }): Promise<SafetyAlarmEventTypeRatioVO[]> {
    const url = `${baseURL2}/safety-alarm-statistics/model-event/ratio`
    const resp = await this.gateway.get<LegacyServiceError<SafetyAlarmEventTypeRatioVO[]>>({ url, payload })
    return resp.data||resp
  }

  /** 安全管理 市场安全任务数统计 */
  public async safetyMarketSafetyCard (payload: {
    period?: string;
    type?: string;
    marketTenant?: string;
    marketTenants?: string[];
  }): Promise<SafetyMarketStatisticsCardVO> {
    const url = `${baseURL2}/safety/marketSafetyCard`
    const resp = await this.gateway.get<LegacyServiceError<SafetyMarketStatisticsCardVO>>({ url, payload })
    return resp.data||resp
  }

  // 统计设备状态数
  public async deviceCountStatus (payload: {
    payload: string;
    metric: string;
  }): Promise<MOMRatio[]> {
    const url = `${baseURL}/safety-management/metric`
    const currentData = [{
      title: '消防设备数',
      imgSrc: 'device-num',
      value: 0,
      unit: '',
      qoq: -12
    },
    {
      title: '在线设备数',
      imgSrc: 'device-online',
      value: 0,
      unit: '',
      qoq: 12
    },
    {
      title: '离线设备数',
      imgSrc: 'device-offline',
      value: 0,
      unit: '',
      qoq: 12
    }]
    const prevData = [{
      title: '消防设备数',
      imgSrc: 'device-num',
      value: 0,
      unit: '',
      qoq: -12
    },
    {
      title: '在线设备数',
      imgSrc: 'device-online',
      value: 0,
      unit: '',
      qoq: 12
    },
    {
      title: '离线设备数',
      imgSrc: 'device-offline',
      value: 0,
      unit: '',
      qoq: 12
    }]
    // 本期数据================================
    const currentRes = await this.gateway.get<{ result: []; }>({ url, payload })
    const currentResp: any[] = currentRes.result
    if (currentResp.length === 0) {
      currentData[0].value = 0
      currentData[1].value = 0
      currentData[2].value = 0
    } else {
      // 在线设备数
      currentData[1].value = currentResp[1] ?? 0
      // 离线设备数
      currentData[2].value = currentResp[0] ?? 0
    }
    // 设备总数
    currentData[0].value = currentData[1].value + currentData[2].value
    // 上期数据=================================
    const prevRes = await this.gateway.get<{ result: []; }>({
      url,
      payload: {
        ...payload,
        // createdPeriod: calculateQoqTime(payload.createdPeriod.split(','))
      }
    })
    const prevResp: unknown[] = prevRes.result
    if (prevResp.length === 0) {
      prevData[0].value = 0
      prevData[1].value = 0
      prevData[2].value = 0
    } else {
      // 在线设备数
      prevData[1].value = currentResp[1]
      // 离线设备数
      prevData[2].value = currentResp[0] ?? 0
    }
    // 设备总数
    prevData[0].value = prevData[1].value + prevData[2].value
    // 计算环比率===============================
    if (prevData[0].value !== 0) {
      currentData[0].qoq = Number(((currentData[0].value - prevData[0].value) * 100 / prevData[0].value).toFixed(2))
    } else {
      currentData[0].qoq = 0
    }
    if (prevData[1].value !== 0) {
      currentData[1].qoq = Number(((currentData[1].value - prevData[1].value) * 100 / prevData[1].value).toFixed(2))
    } else {
      currentData[1].qoq = 0
    }
    if (prevData[2].value !== 0) {
      currentData[2].qoq = Number(((currentData[2].value - prevData[2].value) * 100 / prevData[2].value).toFixed(2))
    } else {
      currentData[2].qoq = 0
    }
    return currentData
  }

  // 统计风险源状态数
  public async riskCountStatus (payload: {
    marketTenantIDs?: string;
    types?: string;
  }): Promise<MOMRatio[]> {
    const url = `${baseURL2}/safety/statistics/property/risk-source/count-status`
    const currentData = [{
      title: '消防设备建档数',
      imgSrc: 'device-put-on-record',
      value: 0,
      unit: '',
      qoq: 12
    },
    {
      title: '消防设备到期数',
      imgSrc: 'device-expire',
      value: 0,
      unit: '',
      qoq: 12
    }]
    const prevData = [{
      title: '消防设备建档数',
      imgSrc: 'device-put-on-record',
      value: 0,
      unit: '',
      qoq: 12
    },
    {
      title: '消防设备到期数',
      imgSrc: 'device-expire',
      value: 0,
      unit: '',
      qoq: 12
    }]
    // 本期数据================================
    const { data: currentResp } = await this.gateway.get<LegacyServiceError<RiskCountStatusType[]>>({ url, payload })
    let curNormal = 0
    if (currentResp.length === 0) {
      currentData[0].value = 0
      currentData[1].value = 0
    } else {
      currentResp.forEach((item: RiskCountStatusType) => {
        // 消防设备到期数
        if (item.status === 'EXPIRE')currentData[1].value = item.count
        // 消防设备未到期数
        if (item.status === 'NORMAL')curNormal = item.count
      })
    }
    currentData[0].value = currentData[1].value + curNormal
    // 上期数据=================================
    const { data: prevResp } = await this.gateway.get<LegacyServiceError<RiskCountStatusType[]>>({
      url,
      payload: {
        ...payload
      }
    })
    let preNormal = 0
    if (prevResp.length === 0) {
      prevData[0].value = 0
      prevData[1].value = 0
    } else {
      prevResp.forEach((item: RiskCountStatusType) => {
        // 消防设备到期数
        if (item.status === 'EXPIRE')prevData[1].value = item.count
        // 消防设备未到期数
        if (item.status === 'NORMAL')preNormal = item.count
      })
    }
    prevData[0].value = prevData[1].value + preNormal
    // 计算环比率===============================
    if (prevData[0].value !== 0) {
      currentData[0].qoq = Number(((currentData[0].value - prevData[0].value) * 100 / prevData[0].value).toFixed(2))
    } else {
      currentData[0].qoq = 0
    }
    if (prevData[1].value !== 0) {
      currentData[1].qoq = Number(((currentData[1].value - prevData[1].value) * 100 / prevData[1].value).toFixed(2))
    } else {
      currentData[1].qoq = 0
    }
    return currentData
  }
}
