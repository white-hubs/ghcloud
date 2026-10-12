import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { LooseWorksRankState } from './type'
const baseURL = `${BASE_API}/safety-management`
const baseURL2 = `${BASE_API}/looseWorks`
// const baseURL = `${BASE_API}`
/**
 * 小散工程
 */
export class CubeSafetyManagementLooseWorkerService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  public async getLooseWorkerStat (payload: {
    period: string;
  }): Promise<Record<string, number>> {
    const url = `${baseURL}/looseWorks/statistics/status-chain`
    const res = await this.gateway.get<LegacyServiceError<Record<string, number>>>({
      url,
      payload
    })
    return res.data ||res
  }

  public async getLooseWorkerRank (payload: {
    period: string;
  }): Promise<LooseWorksRankState> {
    const url = `${baseURL}/looseWorks/statistics/rank`
    const res = await this.gateway.get<LegacyServiceError<LooseWorksRankState>>({
      url,
      payload: {
        ...payload,
        pageNumber: 1,
        pageSize: 100 // 暂定查出100个数据
      }
    })
    return res.data ||res
  }

  // 小散工程趋势统计
  public async getLooseWorkerProjectTrend (payload: {
    period: string;
  }): Promise<unknown> {
    const url = `${baseURL2}/project/trend/statistics`
    const res = await this.gateway.get<LegacyServiceError<unknown>>({
      url,
      payload
    })
    return res.data ||res
  }
}
