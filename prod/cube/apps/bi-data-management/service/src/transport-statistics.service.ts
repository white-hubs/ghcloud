import { type CubeAuth, CubeGateway } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
const baseURL = `${BASE_API}/collection-analysis`

// 来货运转统计
export class CubeTransportStatisticsService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /**
   * 最近一周转运件数趋势
   */
  public async getTransportWeek (payload: {
    begin?: string;
    end?: string;
  }): Promise<TransportWeekDTO[]> {
    const url = `${baseURL}/get/transport/week`
    return this.gateway.get<TransportWeekDTO[]>({ url, payload })
  }

  /**
   * 昨日转运统计
   */
  public async getTransportYesterday (payload: {
    deliveryDate?: string;
  }): Promise<TransportDayDTO> {
    const url = `${baseURL}/get/transport/yesterday`
    return this.gateway.get<TransportDayDTO>({ url, payload })
  }

  /**
   * 近一周装货趋势
   */
  public async getStatLoadTrend (payload: {
    period?: string;
  }): Promise<LoadTrendDTO[]> {
    const url = `${baseURL}/gm/vehicle/stat/load-trend`
    return this.gateway.get<LoadTrendDTO[]>({ url, payload })
  }
}

export interface TransportWeekDTO {
  /**
    * 录入日期
    */
  enterDate?: string;
  /**
    * 普采转运件数数
    */
  normalPieceCount?: number;
  /**
    * 快驴转运件数
    */
  quickPieceCount?: number;
}

export interface TransportDayDTO {
  /**
   * 车次数
   */
  carCount?: number;
  /**
   * 转运件数
   */
  pieceCount?: number;
  /**
   * 转运托数
   */
  transportCount?: number;
  /**
   * 转运日期
   */
  transportDate?: string;
}
export interface LoadTrendDTO {
  trendX?: string;
  trendY?: string;
}
