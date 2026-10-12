import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'

const baseURL = `${BASE_API}/device/device/instance/statistics`

export interface DeviceStatusState {
  alarmNumber: number;
  normalNumber: number;
  offlineNumber: number;
  totalNumber: number;
  troubleNumber: number;
}

export class CubeDeviceStateService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  public async getDeviceStatusStat (): Promise<DeviceStatusState> {
    const url = `${baseURL}/group-by-status`
    const resp = await this.gateway.get<LegacyServiceError<DeviceStatusState>>({ url })
    return resp.data || resp
  }
}
