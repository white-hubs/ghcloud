import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import { calculateQoqTime } from './utils'

const baseURL = `${BASE_API}/safety-management`
export interface AlarmTrend {
  totalNum: number;
  period: string;
}

export interface AlarmHandlerTrend {
  totalNum: number;
  period: string;
}

export interface AlarmTrendAnalysis {
  alarmTrends: AlarmTrend[];
  alarmHandlerTrends: AlarmHandlerTrend[];
}
/**
 * 安全监管报警模块
 */
export class CubeSafetyManagementAlarmService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  // 报警状态分组统计
  public async alarmStatisticsGroup (query: { applicationCode?: string;period: string;marketTenants: string[]; }): Promise<{ status: string;statusName: string;totalNum: number;ratio: number; }[]> {
    const url = `${baseURL}/safety-alarm-statistics/status-group`
    const currentData = [
      {
        status: 'ALARM_TOTAL',
        statusName: '报警数',
        totalNum: 0,
        ratio: 0,
      },
      {
        status: 'ALARM_HANDLER',
        statusName: '已处理报警数',
        totalNum: 0,
        ratio: 0,
      },
      {
        status: 'ALARM_UN_CONFIRMED',
        statusName: '未处理报警数',
        totalNum: 0,
        ratio: 0,
      },
      {
        status: 'ALARM_PROGRESS_CONFIRMED',
        statusName: '处理中报警数',
        totalNum: 0,
        ratio: 0,
      },
      {
        status: 'ALARM_SUSPEND',
        statusName: '已挂起报警数',
        totalNum: 0,
        ratio: 0,
      }
    ]
    const prevData = [
      {
        status: 'ALARM_TOTAL',
        statusName: '报警数',
        totalNum: 0,
        ratio: 0,
      },
      {
        status: 'ALARM_HANDLER',
        statusName: '已处理报警数',
        totalNum: 0,
        ratio: 0,
      },
      {
        status: 'ALARM_UN_CONFIRMED',
        statusName: '未处理报警数',
        totalNum: 0,
        ratio: 0,
      },
      {
        status: 'ALARM_PROGRESS_CONFIRMED',
        statusName: '处理中报警数',
        totalNum: 0,
        ratio: 0,
      },
      {
        status: 'ALARM_SUSPEND',
        statusName: '已挂起报警数',
        totalNum: 0,
        ratio: 0,
      }
    ]
    // 本期数据
    const currentResp = await this.gateway.get<LegacyServiceError<{ status: string;statusName: string;totalNum: number; }[]>>({
      url,
      payload: query
    })
    let data = currentResp.data || currentResp
    if (data.length) {
      currentData.forEach(item => {
        item.totalNum = data.find(e => e.status === item.status)?.totalNum ?? 0
      })
      currentData[2].totalNum = currentData[4].totalNum + currentData[3].totalNum + currentData[2].totalNum
      currentData[0].totalNum = currentData[2].totalNum + currentData[1].totalNum
    } else {
      data = currentData
    }

    // 上期数据
    const prevResp = await this.gateway.get<LegacyServiceError<{ status: string;statusName: string;totalNum: number; }[]>>({
      url,
      payload: {
        ...query,
        period: calculateQoqTime(query.period.split(','))
      }
    })
    let prevRespData = prevResp.data || prevResp
    if (prevRespData.length) {
      prevData.forEach(item => {
        item.totalNum = prevRespData.find(e => e.status === item.status)?.totalNum ?? 0
      })
      prevData[2].totalNum = prevData[4].totalNum + prevData[3].totalNum + prevData[2].totalNum
      prevData[0].totalNum = prevData[1].totalNum + prevData[2].totalNum
    } else {
      prevRespData = prevData
    }
    // 计算环比率
    if (prevData[2].totalNum !== 0) {
      currentData[2].ratio = Number(((currentData[2].totalNum - prevData[2].totalNum) * 100 / prevData[2].totalNum).toFixed(2))
    } else {
      currentData[2].ratio = 0
    }
    if (prevData[1].totalNum !== 0) {
      currentData[1].ratio = Number(((currentData[1].totalNum - prevData[1].totalNum) * 100 / prevData[1].totalNum).toFixed(2))
    } else {
      currentData[1].ratio = 0
    }
    if (prevData[0].totalNum !== 0) {
      currentData[0].ratio = Number(((currentData[2].totalNum - prevData[0].totalNum) * 100 / prevData[0].totalNum).toFixed(2))
    } else {
      currentData[0].ratio = 0
    }
    return currentData.splice(0, 3)
  }

  // 报警事件占比统计
  public async alarmEventTypeRatio (query: { applicationCode: string;period: string;marketTenants?: string[]; }): Promise<{ id: string;
    name: string;
    totalNum: number;
    ratio: string; }[]> {
    const url = `${baseURL}/safety-alarm-statistics/event-type/ratio`
    const resp = await this.gateway.get<LegacyServiceError<{
      id: string;
      name: string;
      totalNum: number;
      ratio: string; }[]>>({
      url,
      payload: query
    })
    return resp.data ||resp
  }

  // 报警事件分类正确率统计
  public async alarmEventActualRatio (query: { applicationCode: string;period: string;marketTenants: string[]; }): Promise<{
    id: string;
    name: string;
    totalNum: number;
    actualNum: number;
    actualRatio: number;
    ratio: number;
  }[]> {
    const url = `${baseURL}/safety-alarm-statistics/event/actual-ratio`
    const currentResp = await this.gateway.get<{ id: string;
      name: string;
      totalNum: number;
      actualNum: number;
      actualRatio: number;
      ratio: number;
    }[]>({
      url,
      payload: query
    })
    const prevResp = await this.gateway.get<{ id: string;
      name: string;
      totalNum: number;
      actualNum: number;
      actualRatio: number; }[]>({
      url,
      payload: {
        ...query,
        period: calculateQoqTime(query.period.split(','))
      }
    })
    currentResp.forEach(item => {
      item.ratio = 0
    })
    prevResp.forEach(prev => {
      currentResp.forEach(current => {
        if (prev.id === current.id) {
          current.ratio = Number(((current.totalNum - prev.totalNum) * 100 / prev.totalNum).toFixed(2))
        }
      })
    })
    return currentResp
  }

  // 报警情况统计
  public async alarmStatisticsSituation (query: { applicationCode: string;period: string; }): Promise<unknown[]> {
    const url = `${baseURL}/safety-alarm-statistics/situation`
    const resp = await this.gateway.get<LegacyServiceError<unknown[]>>({
      url,
      payload: query
    })
    return resp.data ||resp
  }

  // 报警趋势分析统计
  public async alarmTrendAnalysis (query: { applicationCode: string;period: string;type: string; marketTenants: string[]; }): Promise<AlarmTrendAnalysis> {
    const url = `${baseURL}/safety-alarm-statistics/trend-analysis`
    const resp = await this.gateway.get<LegacyServiceError<AlarmTrendAnalysis>>({
      url,
      payload: { ...query }
    })
    return resp.data ||resp
  }
}
