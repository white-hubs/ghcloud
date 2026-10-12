import { authStore } from './auth-store'
import { GatewayProxy, type ServiceError } from '@ghcloud/cube-gateway'
import { CubeFormAuditService } from '@ghcloud/cube-form-audit-service'
import { message } from '@ghcloud/cube-ui'

class ApiProxy extends GatewayProxy {
  public get cubeFormAuditService(): CubeFormAuditService {
    return new CubeFormAuditService(authStore)
  }

  public get cubeFormAuditServiceProxy(): CubeFormAuditService {
    return this.createProxiedInstance(this.cubeFormAuditService)
  }

  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage)
  }
}

const apiProxy = new ApiProxy()
export const cubeFormAuditService = apiProxy.cubeFormAuditServiceProxy
