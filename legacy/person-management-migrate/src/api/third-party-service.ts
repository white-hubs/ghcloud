import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
const baseURL = `/api`
export class CubeThirdPartyService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 查询指定用户权限信息 */
  public async getUserPermissionMobile (mobile: string): Promise<Record<string, unknown>> {
    const url = `${baseURL}/third-party/user/permission/mobile?mobile=${mobile}`
    const resp = await this.gateway.get<Record<string, unknown>>({ url })
    return resp
  }

  /** 修改用户权限**/
  public async updateUserPermissionMobile (payload: {
    mobile: number;
    consumePm: boolean;
    parkingInfos: [];
    doorDeviceList: [];
  }): Promise<unknown> {
    const url = `${baseURL}/third-party/user/permission/modify`
    const resp = await this.gateway.create<LegacyServiceError<unknown>>({ url, payload })
    return resp
  }
}
