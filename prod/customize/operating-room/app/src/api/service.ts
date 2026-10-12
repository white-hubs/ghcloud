import { authStore } from './auth-store'
import { type ServiceError, GatewayProxy } from '@ghcloud/cube-gateway'
import { CubeOperatingRoomService } from '@ghcloud/cube-operating-room-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { message } from '@ghcloud/cube-ui'

class ApiProxy extends GatewayProxy {
  // 手术室服务
  public get cubeOperatingRoomService (): CubeOperatingRoomService {
    return new CubeOperatingRoomService(authStore)
  }

  public get cubeOperatingRoomServiceProxy (): CubeOperatingRoomService {
    return this.createProxiedInstance(this.cubeOperatingRoomService)
  }

  // 文件服务
  public get cubeFileService (): CubeFileService {
    return new CubeFileService(authStore)
  }

  public get cubeFileServiceProxy (): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService)
  }

  // 字典服务
  public get cubeDictionaryService (): CubeDictionaryService {
    return new CubeDictionaryService(authStore)
  }

  public get cubeDictionaryServiceProxy (): CubeDictionaryService {
    return this.createProxiedInstance(this.cubeDictionaryService)
  }

  // 安全管理服务
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

  // 消息中心服务
  public get cubeMessageCenterService (): CubeMessageCenterService {
    return new CubeMessageCenterService(authStore)
  }

  public get cubeMessageCenterServiceProxy (): CubeMessageCenterService {
    return this.createProxiedInstance(this.cubeMessageCenterService)
  }

  // ouaa服务
  public get cubeOuaaService (): CubeOuaaService {
    return new CubeOuaaService(authStore)
  }

  public get cubeOuaaServiceProxy (): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService)
  }

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}

const apiProxy = new ApiProxy()
export const cubeOperatingRoomService = apiProxy.cubeOperatingRoomServiceProxy
export const cubeFileService = apiProxy.cubeFileServiceProxy
export const cubeDictionaryService = apiProxy.cubeDictionaryServiceProxy
export const cubeSecurityManagementService = apiProxy.cubeSecurityManagementServiceProxy
export const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy
export const cubeMessageCenterService = apiProxy.cubeMessageCenterServiceProxy
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy

