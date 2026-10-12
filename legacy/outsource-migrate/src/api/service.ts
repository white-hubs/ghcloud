import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { authStore } from './auth-store'

export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
export const cubeMessageCenterService = new CubeMessageCenterService(authStore)

