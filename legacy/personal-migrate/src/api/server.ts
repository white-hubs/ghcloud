import { CubeOuaaService, GatewayProxy, type CubeAuth } from '@ghcloud/cube-ouaa-service'

import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'

import { authStore } from './auth-store'

/**
 * API代理类，用于创建各种服务的代理实例
 */
class ApiProxy extends GatewayProxy {
  // ouaa服务
  public get cubeOuaaService (): CubeOuaaService {
    return new CubeOuaaService(authStore as CubeAuth)
  }
  public get cubeOuaaServiceProxy (): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService)
  }
  // 消息中心服务
  public get cubeMessageCenterService (): CubeMessageCenterService {
    return new CubeMessageCenterService(authStore as CubeAuth)
  }

  public get cubeMessageCenterServiceProxy (): CubeMessageCenterService {
    return this.createProxiedInstance(this.cubeMessageCenterService)
  }

}

// 创建API代理实例
export const apiProxy = new ApiProxy()

// 导出各服务实例，使用代理模式
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy

export const cubeMessageService = apiProxy.cubeMessageCenterServiceProxy
