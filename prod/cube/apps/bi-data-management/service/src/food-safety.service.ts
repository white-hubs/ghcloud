import { type CubeAuth, CubeGateway } from '@ghcloud/cube-gateway'
import type { FoodSafeStat, FoodSafetyTrendStatVo } from './types'
import { BASE_API } from '@ghcloud/cube-protocol'
const baseURL = `${BASE_API}/collection-analysis`

export class CubeFoodSafetyService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /**
   * 食安统计
   */
  public async getFoodSafetyStat (payload: {
    day: string;
  }): Promise<FoodSafeStat> {
    const url = `${baseURL}/gm/food-safe/stat/day`
    return this.gateway.get<FoodSafeStat>({ url, payload })
  }

  /**
   * 食安近一周检测次数
   */
  public async getFoodSafetyCheckTrend (payload: {
    period: string;
    format: string;
  }): Promise<FoodSafetyTrendStatVo[]> {
    const url = `${baseURL}/gm/food-safe/stat/trend`
    return this.gateway.get<FoodSafetyTrendStatVo[]>({ url, payload })
  }

  /**
   * 获取近30天风险排名
   */
  public async getFoodSafetyRiskRank (payload: {
    day: string;
  }): Promise<FoodSafetyTrendStatVo[]> {
    const url = `${baseURL}/gm/food-safe/stat/ranking`
    return this.gateway.get<FoodSafetyTrendStatVo[]>({ url, payload })
  }
  
  /**
   * 刷新第三方数据
   */
  public async refreshThirdData (): Promise<boolean> {
    const url = `${baseURL}/gm/global/refresh-third-data`;
    const resp = await this.gateway.custom<boolean>({ url, method: "POST" });
    return resp;
  }
}
