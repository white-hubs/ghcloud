import { type CubeAuth, CubeGateway } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'

const baseURL = `${BASE_API}/bracing`

/**
* RiskSourceLedgerVO，查询结果
*/

export class CubeMessageService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  // 获取消息
  public async getMessage (payload: Record<string, string | boolean | number>): Promise<any> {
    const url = `${baseURL}/message/getConfigInfo`
    const res = await this.gateway.get({ url, payload })
    return res
  }

  public async getNoticeCode (code: string): Promise<any> {
    const url = `/api/message2/sat-msg-scene-receive/code/${code}`
    const res = await this.gateway.get({ url })
    return res
  }

  // 添加消息
  public async addMessage (payload: any): Promise<void> {
    const url = `${baseURL}/message/addConfig`
    await this.gateway.create({ url, payload })
  }
}
