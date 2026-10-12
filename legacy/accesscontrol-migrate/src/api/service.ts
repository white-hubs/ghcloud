import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { authStore } from './auth-store'

export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)

