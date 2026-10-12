import { authStore } from './auth-store'
import { GatewayProxy, type ServiceError } from '@ghcloud/cube-gateway'
import { CubeApplicationCenterService } from '@ghcloud/cube-application-center-service'
import { message } from '@ghcloud/cube-ui'
class ApiProxy extends GatewayProxy {

  // 应用服务
  public get cubeApplicationCenterService (): CubeApplicationCenterService {
    return new CubeApplicationCenterService(authStore)
  }

  public get cubeApplicationCenterServiceProxy (): CubeApplicationCenterService {
    return this.createProxiedInstance(this.cubeApplicationCenterService)
  }

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}
const apiProxy = new ApiProxy()
export const cubeApplicationCenterService = apiProxy.cubeApplicationCenterServiceProxy
