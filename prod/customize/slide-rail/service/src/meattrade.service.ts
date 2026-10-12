import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { ArrangeLastInfoVo, SpotCheckStat } from './types'

const baseURL = `${BASE_API}/meattrade`

export class CubeMeattradeService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 理货机面板信息 */
  public async getArrangeLastInfo (payload: {
    deviceId: string;
  }): Promise<ArrangeLastInfoVo> {
    const url = `${baseURL}/pork-bim-stat/device/arrange-last-info/${payload.deviceId}`
    const resp = await this.gateway.get<LegacyServiceError<ArrangeLastInfoVo>>({ url, payload })
    return resp.data||resp
  }

  /** 获取商户食安抽检统计 */
  public async getSpotCheckStat (supplierId: string): Promise<SpotCheckStat> {
    const url = `${baseURL}/merchant/${supplierId}/spot-check/stat`
    const resp = await this.gateway.get<LegacyServiceError<SpotCheckStat>>({ url })
    return resp.data||resp
  }
 
  public async pratiqueRegisterFiles (id: string): Promise<[{
    fileUrl: string;
    fileName: string;
  }]> {
    const url = `${baseURL}/pork-report/${id}/pratique-register/files`
    const resp = await this.gateway.get<LegacyServiceError<[{
      fileUrl: string;
      fileName: string;
    }]>>({ url })
    return resp.data||resp
  } 

  public async previewFile (urlData: string): Promise<Blob> {
    const url = `${urlData}`
    const resp = await this.gateway.customBlob({ url, method: 'GET' })
    return resp
  }
}
