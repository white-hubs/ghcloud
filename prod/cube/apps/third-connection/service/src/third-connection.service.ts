import { type CubeAuth, CubeGateway } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import { DataOverviewData } from './type'

const baseURL = `${BASE_API}/third-connection`

export class CubeThirdConnectionService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  // 数据总览
  public async getEducationalDataOverview (): Promise<DataOverviewData> {
    const url = `${baseURL}/ncdx/educational/visualization`
    const resp = await this.gateway.get<DataOverviewData>({ url })
    return resp
  }
}
