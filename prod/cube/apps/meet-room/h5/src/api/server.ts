import { authStore } from './auth-store'
import { type ServiceError, GatewayProxy } from '@ghcloud/cube-gateway'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMeetRoomService } from '@ghcloud/cube-meet-room-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { showNotify } from 'vant'

class ApiProxy extends GatewayProxy {
  // ouaa服务
  public get cubeOuaaService (): CubeOuaaService {
    return new CubeOuaaService(authStore)
  }

  public get cubeOuaaServiceProxy (): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService)
  }

  // mdata服务
  public get cubeMdataService (): CubeMdataService {
    return new CubeMdataService(authStore)
  }

  public get cubeMdataServiceProxy (): CubeMdataService {
    return this.createProxiedInstance(this.cubeMdataService)
  }

  // 会议室服务
  public get cubeMeetRoomService (): CubeMeetRoomService {
    return new CubeMeetRoomService(authStore)
  }

  public get cubeMeetRoomServiceProxy (): CubeMeetRoomService {
    return this.createProxiedInstance(this.cubeMeetRoomService)
  }

  // 安防服务
  public get cubeSecurityManagementService (): CubeSecurityManagementService {
    return new CubeSecurityManagementService(authStore)
  }

  public get cubeSecurityManagementServiceProxy (): CubeSecurityManagementService {
    return this.createProxiedInstance(this.cubeSecurityManagementService)
  }

  // 设备中心服务
  public get cubeDeviceCenterService (): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore)
  }

  public get cubeDeviceCenterServiceProxy (): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService)
  }

  public override errorNotify (error: ServiceError): void {
    showNotify({ type: 'danger', message: error.errorMessage || '请求失败' })
  }
}

const apiProxy = new ApiProxy()
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy
export const cubeMdataService = apiProxy.cubeMdataServiceProxy
export const cubeMeetRoomService = apiProxy.cubeMeetRoomServiceProxy
export const cubeSecurityService = apiProxy.cubeSecurityManagementServiceProxy
export const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy

