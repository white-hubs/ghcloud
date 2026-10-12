import { authStore } from './auth-store'
import { type ServiceError, GatewayProxy } from '@ghcloud/cube-gateway'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { CubeFlowService } from '@ghcloud/cube-stream-engine-service'
import { message } from '@ghcloud/cube-ui'
class ApiProxy extends GatewayProxy {
  // ouaa服务
  public get cubeOuaaService (): CubeOuaaService {
    return new CubeOuaaService(authStore)
  }

  public get cubeOuaaServiceProxy (): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService)
  }

  // 消息服务
  public get cubeMessageCenterService (): CubeMessageCenterService {
    return new CubeMessageCenterService(authStore)
  }

  public get cubeMessageCenterServiceProxy (): CubeMessageCenterService {
    return this.createProxiedInstance(this.cubeMessageCenterService)
  }

  // 流引擎服务
  public get cubeFlowService (): CubeFlowService {
    return new CubeFlowService(authStore)
  }

  public get cubeFlowServiceProxy (): CubeFlowService {
    return this.createProxiedInstance(this.cubeFlowService)
  }

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}
const apiProxy = new ApiProxy()
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy
export const cubeMessageCenterService = apiProxy.cubeMessageCenterServiceProxy
export const cubeFlowService = apiProxy.cubeFlowServiceProxy
