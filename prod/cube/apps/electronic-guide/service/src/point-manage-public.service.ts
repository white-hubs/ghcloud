import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { PageVo, PointVo } from './type'
const baseURL = `${BASE_API}/electron-guide`

export class CubeElectronicGuidePointPublicService {
  private readonly gateway: CubeGateway

  public constructor (auth?: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  public async getPointList (
    payload: {
      keyword?: string;
      pageNumber: number;
      pageSize: number;
      typeId?: string;
      areaId?: string | undefined;
      state?: string;
      sequence?: boolean;
    }
  ): Promise<PageVo<PointVo>> {
    const url = `${baseURL}/public/point/anage/page`
    const resp = await this.gateway.get<LegacyServiceError<PageVo<PointVo>>>({
      url,
      payload: {
        ...payload,
        areaAccurateMatching: true,
        sequence: true
      }
    })
    return resp.data||resp
  }
}
