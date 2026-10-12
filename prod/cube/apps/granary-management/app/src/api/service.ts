import { GatewayProxy, type ServiceError } from '@ghcloud/cube-gateway'
import { message } from '@ghcloud/cube-ui'
import { CubeGranaryManagementService } from '@ghcloud/cube-granary-management-service'
import { authStore } from './auth-store'

class ApiProxy extends GatewayProxy {
  public get cubeGranaryManagementService (): CubeGranaryManagementService {
    return new CubeGranaryManagementService(authStore)
  }

  public get cubeGranaryManagementServiceProxy (): CubeGranaryManagementService {
    return this.createProxiedInstance(this.cubeGranaryManagementService)
  }

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}

const apiProxy = new ApiProxy()
export const cubeGranaryManagementService = apiProxy.cubeGranaryManagementServiceProxy
