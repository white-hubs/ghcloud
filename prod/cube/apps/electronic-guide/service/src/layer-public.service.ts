import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { LayerInfoVo } from './type'
const baseURL = `${BASE_API}/electron-guide`

export class CubeElectronicGuideLayerPublicService {
  private readonly gateway: CubeGateway

  public constructor (auth?: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  public async getAreaLayerInfo (
    payload: {
      areaId: string;
    }
  ): Promise<LayerInfoVo> {
    const url = `${baseURL}/public/layer/state`
    const resp = await this.gateway.get<LegacyServiceError<LayerInfoVo>>({
      url,
      payload
    })
    return resp.data||resp
  }
}
