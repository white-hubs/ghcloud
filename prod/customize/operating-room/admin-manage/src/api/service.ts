import { GatewayProxy, type ServiceError } from '@ghcloud/cube-gateway'
import { CubeDeviceCenterService, CubeDeviceMonitorService, CubeDeviceCenterInternalService, CubeDeviceSuperviseService, CubeDeviceAlarmService } from '@ghcloud/cube-iot-center-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeOperatingRoomService } from '@ghcloud/cube-operating-room-service'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { message } from '@ghcloud/cube-ui'
import { authStore } from './auth-store'
import { CubeFileService } from '@ghcloud/cube-file-service'

class ApiProxy extends GatewayProxy {
  public get cubeDeviceCenterService (): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore)
  }

  public get cubeDeviceCenterServiceProxy (): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService)
  }

  public get cubeDeviceMonitorService (): CubeDeviceMonitorService {
    return new CubeDeviceMonitorService(authStore)
  }

  public get cubeDeviceMonitorServiceProxy (): CubeDeviceMonitorService {
    return this.createProxiedInstance(this.cubeDeviceMonitorService)
  }

  public get cubeDeviceCenterInternalService (): CubeDeviceCenterInternalService {
    return new CubeDeviceCenterInternalService(authStore)
  }

  public get cubeDeviceCenterInternalServiceProxy (): CubeDeviceCenterInternalService {
    return this.createProxiedInstance(this.cubeDeviceCenterInternalService)
  }

  public get cubeDeviceSuperviseService (): CubeDeviceSuperviseService {
    return new CubeDeviceSuperviseService(authStore)
  }

  public get cubeDeviceSuperviseServiceProxy (): CubeDeviceSuperviseService {
    return this.createProxiedInstance(this.cubeDeviceSuperviseService)
  }

  public get cubeDeviceAlarmService (): CubeDeviceAlarmService {
    return new CubeDeviceAlarmService(authStore)
  }

  public get cubeDeviceAlarmServiceProxy (): CubeDeviceAlarmService {
    return this.createProxiedInstance(this.cubeDeviceAlarmService)
  }

  public get cubeOuaaService (): CubeOuaaService {
    return new CubeOuaaService(authStore)
  }

  public get cubeOuaaServiceProxy (): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService)
  }

  public get cubeOperatingRoomService (): CubeOperatingRoomService {
    return new CubeOperatingRoomService(authStore)
  }

  public get cubeOperatingRoomServiceProxy (): CubeOperatingRoomService {
    return this.createProxiedInstance(this.cubeOperatingRoomService)
  }

  public get cubeSecurityManagementService (): CubeSecurityManagementService {
    return new CubeSecurityManagementService(authStore)
  }

  public get cubeSecurityManagementServiceProxy (): CubeSecurityManagementService {
    return this.createProxiedInstance(this.cubeSecurityManagementService)
  }

  public get cubeMdataService (): CubeMdataService {
    return new CubeMdataService(authStore)
  }

  public get cubeMdataServiceProxy (): CubeMdataService {
    return this.createProxiedInstance(this.cubeMdataService)
  }

  public get cubeFileService (): CubeFileService {
    return new CubeFileService(authStore)
  }

  public get cubeFileServiceProxy (): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService)
  }

  public get cubeDictionaryService (): CubeDictionaryService {
    return new CubeDictionaryService(authStore)
  }

  public get cubeDictionaryServiceProxy (): CubeDictionaryService {
    return this.createProxiedInstance(this.cubeDictionaryService)
  }

  public get cubeMessageCenterService (): CubeMessageCenterService {
    return new CubeMessageCenterService(authStore)
  }

  public get cubeMessageCenterServiceProxy (): CubeMessageCenterService {
    return this.createProxiedInstance(this.cubeMessageCenterService)
  }

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}
const apiProxy = new ApiProxy()
export const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy
export const cubeDeviceMonitorService = apiProxy.cubeDeviceMonitorServiceProxy
export const cubeDeviceCenterInternalService = apiProxy.cubeDeviceCenterInternalServiceProxy
export const cubeDeviceSuperviseService = apiProxy.cubeDeviceSuperviseServiceProxy
export const cubeDeviceAlarmService = apiProxy.cubeDeviceAlarmServiceProxy
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy
export const cubeOperatingRoomService = apiProxy.cubeOperatingRoomServiceProxy
export const cubeSecurityManagementService = apiProxy.cubeSecurityManagementServiceProxy
export const cubeMdataService = apiProxy.cubeMdataServiceProxy
export const cubeDictionaryService = apiProxy.cubeDictionaryServiceProxy
export const cubeMessageCenterService = apiProxy.cubeMessageCenterServiceProxy
export const cubeFileService = apiProxy.cubeFileServiceProxy
