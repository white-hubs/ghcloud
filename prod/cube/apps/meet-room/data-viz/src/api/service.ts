import { authStore } from './auth-store'
import { type ServiceError, GatewayProxy } from '@ghcloud/cube-gateway'
import { CubeMeetRoomPublicService } from '@ghcloud/cube-meet-room-service'
import { message } from '@ghcloud/cube-ui'

class ApiProxy extends GatewayProxy {
  // 会议室公共服务
  public get cubeMeetRoomPublicService (): CubeMeetRoomPublicService {
    return new CubeMeetRoomPublicService(authStore)
  }

  public get cubeMeetRoomPublicServiceProxy (): CubeMeetRoomPublicService {
    return this.createProxiedInstance(this.cubeMeetRoomPublicService)
  }

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}

const apiProxy = new ApiProxy()
export const cubeMeetRoomPublicService = apiProxy.cubeMeetRoomPublicServiceProxy

