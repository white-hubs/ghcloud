import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'

const baseFlowURL = `${BASE_API}/flow`

export class CubeHiddenDangerService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  // 分页查询档位列表
  public async genFlowNumber (payload: {
    applicationCode: string;
    period: string;
  }): Promise<{ waitingCount: number; finishedCount: number; submitCount: number; }> {
    const url = `${baseFlowURL}/statistics/user/flow/number`
    const resp = await this.gateway.get<LegacyServiceError<{ waitingCount: number; finishedCount: number; submitCount: number; }>>({ url, payload })
    return resp.data||resp
  }
}
