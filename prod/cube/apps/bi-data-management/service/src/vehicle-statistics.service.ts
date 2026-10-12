import { type CubeAuth, CubeGateway } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
const baseURL = `${BASE_API}/collection-analysis`
// const baseURL = `${BASE_API}`

export interface VehicleStatTrend {
  trendX: string;
  trendY: number;
}
export class CubeVehicleStatisticsService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /**
   * 车辆统计
   */
  public async vehicleStatTotal (payload: {
    period: string;
  }): Promise<Record<string, number>> {
    const url = `${baseURL}/gm/vehicle/stat/total`
    return this.gateway.get<Record<string, number>>({ url, payload })
  }

  /**
   * 查询车辆趋势
   */
  public async vehicleStatTrend (payload: {
    period: string;
    vehicleNature: string;
  }): Promise<VehicleStatTrend[]> {
    const url = `${baseURL}/gm/vehicle/stat/trend`
    return this.gateway.get<VehicleStatTrend[]>({ url, payload })
  }

  /**
   * 近一日车进场流分布图
   */
  public async vehicleStatDayTrend (payload: {
    day: string;
    vehicleNature: string;
  }): Promise<VehicleStatTrend[]> {
    const url = `${baseURL}/gm/vehicle/stat/day-trend`
    return this.gateway.get<VehicleStatTrend[]>({ url, payload })
  }
}
