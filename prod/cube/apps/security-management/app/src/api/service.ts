import { authStore } from './auth-store'
import { type ServiceError, GatewayProxy } from '@ghcloud/cube-gateway'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { message } from '@ghcloud/cube-ui'

class ApiProxy extends GatewayProxy {
  // 物联中心服务
  public get cubeDeviceCenterService (): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore)
  }

  public get cubeDeviceCenterServiceProxy (): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService)
  }
  // MDATA
  public get cubeMdataService (): CubeMdataService {
    return new CubeMdataService(authStore)
  }

  public get cubeMdataServiceProxy (): CubeMdataService {
    return this.createProxiedInstance(this.cubeMdataService)
  }

  // MDATA
  public get cubeSecurityManagementService (): CubeSecurityManagementService {
    return new CubeSecurityManagementService(authStore)
  }

  public get cubeSecurityManagementServiceProxy (): CubeSecurityManagementService {
    return this.createProxiedInstance(this.cubeSecurityManagementService)
  }
  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}
const apiProxy = new ApiProxy()
export const cubeDeviceCenter = apiProxy.cubeDeviceCenterServiceProxy
export const cubeMdata = apiProxy.cubeMdataServiceProxy
export const cubeSecurityManagement = apiProxy.cubeSecurityManagementServiceProxy
