import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { RegionVo } from './type'
const baseURL = `${BASE_API}/electron-guide`

export class CubeElectronicGuidePublicRegionService {
  private readonly gateway: CubeGateway

  public constructor (auth?: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  public async getRegionTree (): Promise<RegionVo[]> {
    const url = `${baseURL}/public/guide/area/tree`
    const resp = await this.gateway.get<LegacyServiceError<RegionVo[]>>({
      url,
      payload: {
        state: 'ENABLE'
      }
    })
    return resp.data||resp
  }

  public async getRegionById (id: string): Promise<RegionVo> {
    const url = `${baseURL}/public/guide/area/${id}`
    const resp = await this.gateway.get<LegacyServiceError<RegionVo>>({
      url,
    })
    return resp.data||resp
  }
}
