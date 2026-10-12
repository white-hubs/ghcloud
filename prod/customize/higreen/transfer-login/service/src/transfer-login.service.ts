import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import type { AuthVo } from '@ghcloud/cube-auth-service'
const baseUrl = '/custom-api'
/** 中转服务 */
export class TransferLoginService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 中转 获取登录验证信息 */
  public async transferLogin (payload: {
    authentication: string;
    user_name: string;
  }): Promise<AuthVo> {
    const url = `${baseUrl}/auth_login`
    const resp = await this.gateway.create<LegacyServiceError<AuthVo>>({ url, payload })
    return resp.data||resp
  }
}
 