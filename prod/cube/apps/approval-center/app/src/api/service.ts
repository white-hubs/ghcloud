import { authStore } from './auth-store'
import { GatewayProxy, type ServiceError } from '@ghcloud/cube-gateway'
import { CubeApprovalCenterService } from '@ghcloud/cube-approval-center-service'
import { message } from '@ghcloud/cube-ui'
class ApiProxy extends GatewayProxy {
  // 审批中心服务
  public get cubeApprovalCenterService (): CubeApprovalCenterService {
    return new CubeApprovalCenterService(authStore)
  }

  public get cubeApprovalCenterServiceProxy (): CubeApprovalCenterService {
    return this.createProxiedInstance(this.cubeApprovalCenterService)
  }

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}
const apiProxy = new ApiProxy()
export const cubeApprovalCenterService = apiProxy.cubeApprovalCenterServiceProxy
