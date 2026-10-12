import { GatewayProxy, type ServiceError } from '@ghcloud/cube-gateway'
import { CubeBusinessTagService } from '@ghcloud/cube-business-tag-service'
import { authStore } from './auth-store'
import { message } from '@ghcloud/cube-ui'

class ApiProxy extends GatewayProxy {

  public get cubeBusinessTagService (): CubeBusinessTagService {
    return new CubeBusinessTagService(authStore)
  }
  public get cubeBusinessTagServiceProxy (): CubeBusinessTagService {
    return this.createProxiedInstance(this.cubeBusinessTagService)
  }

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}

const apiProxy = new ApiProxy()
export const cubeBusinessTagService = apiProxy.cubeBusinessTagServiceProxy

