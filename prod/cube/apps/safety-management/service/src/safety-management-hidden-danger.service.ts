import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import { type HiddenDangerHandleState, HiddenStatusEnum, type HiddenDangerMarketState, type RankResult } from './type'
import { calculateQoqTime } from './utils'
const baseURL = `${BASE_API}/safety-management`
const baseURL2 = `${BASE_API}/maintain`
export interface HiddenDangerResultState {
  all: {
    count: number;
    ratio: string;
  };
  unhandle: {
    count: number;
    ratio: string;
  };
  handle: {
    count: number;
    ratio: string;
  };
}
export interface HiddenDangerTypeStatisticsVO {
  totalNum?: number | null;
  typeStatisticsList?: HiddenDangerTypeStatistics[] | null;
}
export interface HiddenDangerTypeStatistics {
  name?: null | string;
  num?: number | null;
  proportion?: number | null;
}

/**
 * 安全监管报警模块
 */
export class CubeSafetyManagementHiddenDangerService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  // 隐患统计
  public async getSafetyHiddenDangerHandleState (payload: { marketTenantIDs?: string;createdPeriod: string; }): Promise<HiddenDangerResultState> {
    const url = `${baseURL}/safety/statistics/hidden-danger/count-process-status`
    const prevTime = calculateQoqTime(payload.createdPeriod.split(','))
    const result = {
      all: {
        count: 0,
        ratio: '0'
      },
      unhandle: {
        count: 0,
        ratio: '0'
      },
      handle: {
        count: 0,
        ratio: '0'
      }
    }
    // 当前周期的数据
    const currentResp = await this.gateway.get<LegacyServiceError<HiddenDangerHandleState[]>>({
      url,
      payload
    })
    const data = currentResp.data || currentResp
    for (const item of data) {
      // 待处理和待确认为未处理
      if ([HiddenStatusEnum.WAITING_CONFIRM, HiddenStatusEnum.WAITING_FOR_HANDLE].includes(item.groupKey)) {
        result.unhandle.count += item.count
      } else {
        result.handle.count += item.count
      }
      result.all.count += item.count
    }

    // 上一个周期的数据
    const prevResp = await this.gateway.get<LegacyServiceError<HiddenDangerHandleState[]>>({
      url,
      payload: {
        ...payload,
        createdPeriod: prevTime.join(',')
      }
    })
    
    // 计算上一个周期的数据
    // 上一个周期的数据
    const prevResult = {
      all: 0,
      unhandle: 0,
      handle: 0
    }
     const prevRespData = prevResp.data || prevResp
    for (const item of prevRespData) {
      // 待处理和待确认为未处理
      if ([HiddenStatusEnum.WAITING_CONFIRM, HiddenStatusEnum.WAITING_FOR_HANDLE].includes(item.groupKey)) {
        prevResult.unhandle += item.count
      } else {
        prevResult.handle += item.count
      }
      prevResult.all += item.count
    }
    // // 计算环比率
    if (prevResult.all !== 0) {
      result.all.ratio = ((result.all.count - prevResult.all) * 100 / prevResult.all).toFixed(2)
    } else {
      result.all.ratio = '0'
    }
    if (prevResult.unhandle !== 0) {
      result.unhandle.ratio = ((result.unhandle.count - prevResult.unhandle) * 100 / prevResult.unhandle).toFixed(2)
    } else {
      result.unhandle.ratio = '0'
    }
    if (prevResult.handle !== 0) {
      result.handle.ratio = ((result.handle.count - prevResult.handle) * 100 / prevResult.handle).toFixed(2)
    } else {
      result.handle.ratio = '0'
    }
    return { ...result }
  }

  // 隐患排名
  public async getSafetyHiddenDangerRank (payload: { marketTenantIDs?: string;createdPeriod: string; }): Promise<HiddenDangerMarketState[]> {
    const url = `${baseURL}/safety/statistics/hidden-danger/count-market-process-status`
    const res = await this.gateway.get<LegacyServiceError<HiddenDangerMarketState[]>>({
      url,
      payload
    })
    return res.data ||res
  }

  // 根据状态隐患计算排名数据
  public computedRankResult (rankData: HiddenDangerMarketState[], field: string): RankResult[] {
    const result = rankData.map(item => {
      let count = 0
      let unhandleCount = 0
      let handleCount = 0
      let value = 0
      for (const key in item.countStatus) {
        const statusCount = item.countStatus[key]
        // 未处理的
        if (['WAITING_CONFIRM', 'WAITING_FOR_HANDLE'].includes(key)) {
          unhandleCount += statusCount
        } else {
          handleCount += statusCount
        }
        count += statusCount
      }
      if (field === 'all') {
        value = count
      } else if (field === 'handle') {
        value = handleCount
      } else {
        value = unhandleCount
      }
      return {
        name: item.tenantName,
        id: item.tenantID,
        value
      }
    }).sort((a, b) => b.value - a.value)
    return result
  }

  // 隐患分类统计
  public async hiddenTypeStatistics (payload: {
    period?: string;
  }): Promise<HiddenDangerTypeStatisticsVO> {
    const url = `${baseURL2}/hidden/type/statistics`
    const resp = await this.gateway.get<LegacyServiceError<HiddenDangerTypeStatisticsVO>>({ url, payload })
    return resp.data || resp
  }
}
