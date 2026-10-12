import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { authStore } from './auth-store'

export const cubeSecurityManagementService = new CubeSecurityManagementService(authStore)
export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeMdataService = new CubeMdataService(authStore)
