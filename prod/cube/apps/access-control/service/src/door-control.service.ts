import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { DoorDeviceVo, DoorTypeVo, PageResult } from './types'
const baseURL = `${BASE_API}/door`

export class CubeDoorControlService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }
  // const resp = await this.gateway.get<LegacyServiceError<{ records: WorkRecordPageVO[]; total: number; }>>({ url, payload })

  /**
   * 获取门禁类型列表
   */
  public async getDoorTypeList (): Promise<DoorTypeVo[]> {
    const url = `${baseURL}/getDoorType`
    const resp = await this.gateway.get<LegacyServiceError<DoorTypeVo[]>>({ url })
    return resp.data ||resp
  }

  /**
   * 分页获取门禁设备
   */
  public async getDoorDevicePage (payload: {
    pageSize: number;
    pageNumber: number;
    type: string;
    doorArea: string;
    keyword: string;
    applicationCode?: string;
  }): Promise<PageResult<DoorDeviceVo>> {
    const url = `${baseURL}/getDoorDevicePage`
    const resp = await this.gateway.get<LegacyServiceError<PageResult<DoorDeviceVo>>>({ url, payload })
    return resp.data ||resp
  }
}
