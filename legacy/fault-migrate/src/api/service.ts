import { CubeDeviceCenterService,GatewayProxy, type ServiceError } from '@ghcloud/cube-iot-center-service'
import { CubeFaultRepairService } from "@ghcloud/cube-fault-repair-service"
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { authStore } from './auth-store'
import { message} from 'ant-design-vue'

export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
export const cubeMessageCenterService = new CubeMessageCenterService(authStore)


class ApiProxy extends GatewayProxy {

  // 不走代理
  public get cubeFaultRepairService ():CubeFaultRepairService {
    return new CubeFaultRepairService(authStore)
  }

  // 走代理
  public get cubeFaultRepairServiceProxy (): CubeFaultRepairService {
    return this.createProxiedInstance(this.cubeFaultRepairService)
  }

  override errorNotify(error: ServiceError){
    message.error(error.errorMessage)
  }
}

export const apiProxy = new ApiProxy()