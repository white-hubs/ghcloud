import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'

const baseURL = `${BASE_API}`

/**
 * 安全管理（市场端服务）
 */
export class CubeSafetyManagementMarketService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  public async listMarket (): Promise<unknown[]> {
    const url = `${baseURL}/dataintegrate/market-config/list`
    const resp = await this.gateway.get<LegacyServiceError<unknown[]>>({ url })
    return resp.data ||resp
  }
}
