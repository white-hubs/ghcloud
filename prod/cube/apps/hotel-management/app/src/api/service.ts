import { authStore } from './auth-store'
import { GatewayProxy, type ServiceError } from '@ghcloud/cube-gateway'
import { CubeHotelManagementService } from '@ghcloud/cube-hotel-management-service'
import { message } from '@ghcloud/cube-ui'
class ApiProxy extends GatewayProxy {
  // 酒店管理服务
  public get cubeHotelManagementService (): CubeHotelManagementService {
    return new CubeHotelManagementService(authStore)
  }

  public get cubeHotelManagementServiceProxy (): CubeHotelManagementService {
    return this.createProxiedInstance(this.cubeHotelManagementService)
  }

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}
const apiProxy = new ApiProxy()
export const cubeHotelManagementService = apiProxy.cubeHotelManagementServiceProxy
