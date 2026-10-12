import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { UserVO } from './types'

const baseURL = `${BASE_API}`
/** 用户中心服务 */
export class CubeUserCenterService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 用户中心，用户信息接口 分页 */
  public async getRegisterUserPage (payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string;
    mobile?: string;
  }): Promise<{ records: UserVO[]; total: number; }> {
    const url = `${baseURL}/ouaa/user-under-tenant/register-user/list`
    const resp = await this.gateway.get<LegacyServiceError<{ records: UserVO[]; total: number; }>>({ url, payload })
    return resp.data||resp
  }

  /** 用户中心，用户信息详情 */
  public async getRegisterUserDetail (payload: {
    id?: number;
  }): Promise<UserVO> {
    const url = `${baseURL}/ouaa/user-under-tenant/register-user/detail`
    const resp = await this.gateway.get<LegacyServiceError<UserVO>>({ url, payload })
    return resp.data||resp
  }
}
