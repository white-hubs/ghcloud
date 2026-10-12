import { authStore } from './auth-store'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
export const cubeSecurityService = new CubeSecurityManagementService(authStore)
