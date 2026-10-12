import { authStore } from './auth-store'
import { GatewayProxy, type ServiceError } from '@ghcloud/cube-gateway'
import { CubeWorkOrderCenterService } from '@ghcloud/cube-work-order-center-service'
import { message } from '@ghcloud/cube-ui'
class ApiProxy extends GatewayProxy {
  // 工作中心服务
  public get cubeWorkOrderCenterService (): CubeWorkOrderCenterService {
    return new CubeWorkOrderCenterService(authStore)
  }

  public get cubeWorkOrderCenterServiceProxy (): CubeWorkOrderCenterService {
    return this.createProxiedInstance(this.cubeWorkOrderCenterService)
  }

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}
const apiProxy = new ApiProxy()
export const cubeWorkOrderCenterService = apiProxy.cubeWorkOrderCenterServiceProxy
