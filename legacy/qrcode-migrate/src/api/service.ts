import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeIdentityService } from '@ghcloud/cube-risk-management-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { authStore } from './auth-store'

export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
export const cubeIdentityService = new CubeIdentityService(authStore)
export const cubeFileService = new CubeFileService(authStore)