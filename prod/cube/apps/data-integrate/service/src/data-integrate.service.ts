import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'

const baseURL = `${BASE_API}/dataintegrate`

export interface MarketConfig {
  account: string;
  address: string;
  coordinate: string;
  executorCode: string;
  executorPort: number;
  files: unknown[];
  foundTime: string;
  id: string;
  marketArea: number;
  marketCode: string;
  marketName: string;
  marketTenant: number;
  password: string;
  status: boolean;
  url: string;
}

/** 数据采集服务 */
export class CubeDataIntegrateService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 数据采集——查询市场配置 */
  public async getMarketConfigList (): Promise<MarketConfig[]> {
    const url = `${baseURL}/market-config/list`
    const resp = await this.gateway.get<LegacyServiceError<MarketConfig[]>>({ url })
    return resp.data||resp
  }

  /** 查询市场配置详情 */
  public async getMarketConfigDetail (id: string): Promise<MarketConfig> {
    const url = `${baseURL}/market-config/${id}`
    const resp = await this.gateway.get<LegacyServiceError<MarketConfig>>({ url })
    return resp.data||resp
  }

}
