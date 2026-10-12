import { authStore } from './auth-store'
import { type ServiceError, GatewayProxy } from '@ghcloud/cube-gateway'
import { CubeDeviceCenterService, CubeDeviceCenterInternalService, CubeDeviceSuperviseService, CubeDeviceAlarmService } from '@ghcloud/cube-iot-center-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeOperatingRoomService } from '@ghcloud/cube-operating-room-service'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { message } from '@ghcloud/cube-ui'

class ApiProxy extends GatewayProxy {
  // 设备中心服务
  public get cubeDeviceCenterService (): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore)
  }

  public get cubeDeviceCenterServiceProxy (): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService)
  }

  // 设备中心内部服务
  public get cubeDeviceCenterInternalService (): CubeDeviceCenterInternalService {
    return new CubeDeviceCenterInternalService(authStore)
  }

  public get cubeDeviceCenterInternalServiceProxy (): CubeDeviceCenterInternalService {
    return this.createProxiedInstance(this.cubeDeviceCenterInternalService)
  }

  // 设备监管服务
  public get cubeDeviceSuperviseService (): CubeDeviceSuperviseService {
    return new CubeDeviceSuperviseService(authStore)
  }

  public get cubeDeviceSuperviseServiceProxy (): CubeDeviceSuperviseService {
    return this.createProxiedInstance(this.cubeDeviceSuperviseService)
  }

  // 设备告警服务
  public get cubeDeviceAlarmService (): CubeDeviceAlarmService {
    return new CubeDeviceAlarmService(authStore)
  }

  public get cubeDeviceAlarmServiceProxy (): CubeDeviceAlarmService {
    return this.createProxiedInstance(this.cubeDeviceAlarmService)
  }

  // ouaa服务
  public get cubeOuaaService (): CubeOuaaService {
    return new CubeOuaaService(authStore)
  }

  public get cubeOuaaServiceProxy (): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService)
  }

  // 手术室服务
  public get cubeOperatingRoomService (): CubeOperatingRoomService {
    return new CubeOperatingRoomService(authStore)
  }

  public get cubeOperatingRoomServiceProxy (): CubeOperatingRoomService {
    return this.createProxiedInstance(this.cubeOperatingRoomService)
  }

  // 安全管理服务
  public get cubeSecurityManagementService (): CubeSecurityManagementService {
    return new CubeSecurityManagementService(authStore)
  }

  public get cubeSecurityManagementServiceProxy (): CubeSecurityManagementService {
    return this.createProxiedInstance(this.cubeSecurityManagementService)
  }

  // 元数据服务
  public get cubeMdataService (): CubeMdataService {
    return new CubeMdataService(authStore)
  }

  public get cubeMdataServiceProxy (): CubeMdataService {
    return this.createProxiedInstance(this.cubeMdataService)
  }

  // 文件服务
  public get cubeFileService (): CubeFileService {
    return new CubeFileService(authStore)
  }

  public get cubeFileServiceProxy (): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService)
  }

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}

const apiProxy = new ApiProxy()
export const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy
export const cubeDeviceCenterInternalService = apiProxy.cubeDeviceCenterInternalServiceProxy
export const cubeDeviceSuperviseService = apiProxy.cubeDeviceSuperviseServiceProxy
export const cubeDeviceAlarmService = apiProxy.cubeDeviceAlarmServiceProxy
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy
export const cubeOperatingRoomService = apiProxy.cubeOperatingRoomServiceProxy
export const cubeSecurityManagementService = apiProxy.cubeSecurityManagementServiceProxy
export const cubeMdataService = apiProxy.cubeMdataServiceProxy
export const cubeFileService = apiProxy.cubeFileServiceProxy
