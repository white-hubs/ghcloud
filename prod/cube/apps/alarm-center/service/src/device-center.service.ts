import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { IotDeviceProps, DeviceDetails } from './type'
const baseURL = `${BASE_API}/device-center`
export class CubeDeviceCenterService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 获取设备详情 */
  public async getDeviceDetails (id: string): Promise<DeviceDetails> {
    const url = `${baseURL}/device/${id}`
    const resp = await this.gateway.get<LegacyServiceError<DeviceDetails>>({
      url,
    })
    return resp.data || resp
  }

  /** 获取设备关联属性 */
  public async getDeviceProperties (payload: {
    deviceId: string;
    withPropertySpec: boolean;
    withSnapShot: boolean;
  }): Promise<IotDeviceProps> {
    const url = '/api/iot/north/device/detail'
    const resp = await this.gateway.get<LegacyServiceError<IotDeviceProps>>({
      url,
      payload
    })
    return resp.data || resp
  }
}
