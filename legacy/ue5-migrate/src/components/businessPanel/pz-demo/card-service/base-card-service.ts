import { CubeTerminalEnum } from '@ghcloud/cube-protocol'
import { CubeGateway } from '@ghcloud/cube-gateway'
import { authStore } from '@/api/auth-store'

/**
 * @description 彭州卡片服务基座
 */
export class PZBaseCardService{
  private readonly gateway: CubeGateway

  public constructor () {
    this.gateway = new CubeGateway({
      terminal: CubeTerminalEnum.VISUALIZATION,
      tenant: authStore.tenant,
      token: authStore.token
    })
  }

  protected async get<T> (url: string, payload?: Record<string, unknown>): Promise<T> {
    return this.gateway.get<T>({ url, payload })
  }
}