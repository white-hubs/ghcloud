import { authStore } from './auth-store'
import { GatewayProxy, type ServiceError } from '@ghcloud/cube-iot-center-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMaintainService } from '@ghcloud/cube-maintain-service'
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

  // maintain服务
  public get cubeMaintainService (): CubeMaintainService {
    return new CubeMaintainService(authStore)
  }

  public get cubeMaintainServiceProxy (): CubeMaintainService {
    return this.createProxiedInstance(this.cubeMaintainService)
  }

  // flow服务
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
export const cubeMaintainService = apiProxy.cubeMaintainServiceProxy
export const cubeFlowService = apiProxy.cubeFlowServiceProxy
