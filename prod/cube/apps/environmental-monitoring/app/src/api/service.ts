import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeDeviceCenterService, CubeDeviceMonitorService } from '@ghcloud/cube-iot-center-service'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { authStore } from './auth-store'

export const cubeFileService = new CubeFileService(authStore)
export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
export const cubeDeviceMonitorService = new CubeDeviceMonitorService(authStore)
export const cubeSecurityManagementService = new CubeSecurityManagementService(authStore)
