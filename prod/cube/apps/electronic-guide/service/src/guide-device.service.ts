import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { PageVo, GuideDeviceVo } from './type'
const baseURL = `${BASE_API}/electron-guide`

export class CubeElectronicGuideDevicePublicService {
  private readonly gateway: CubeGateway

  public constructor (auth?: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  public async getDeviceList (): Promise<PageVo<GuideDeviceVo>> {
    const url = `${baseURL}/public/guide/device/page`
    const resp = await this.gateway.get<LegacyServiceError<PageVo<GuideDeviceVo>>>({
      url,
      payload: {
        pageNumber: 1,
        pageSize: 1000,
      }
    })
    return resp.data||resp
  }
}
