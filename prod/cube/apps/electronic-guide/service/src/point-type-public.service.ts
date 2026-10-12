import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { PointTypeVo } from './type'
const baseURL = `${BASE_API}/electron-guide`

export class CubeElectronicGuidePublicPointTypeService {
  private readonly gateway: CubeGateway

  public constructor (auth?: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  public async getPointTypeList (): Promise<PointTypeVo[]> {
    const url = `${baseURL}/public/point-types`
    const resp = await this.gateway.get<LegacyServiceError<PointTypeVo[]>>({
      url,
    })
    return resp.data||resp
  }
}
