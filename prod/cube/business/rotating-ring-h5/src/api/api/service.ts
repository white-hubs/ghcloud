import { CubeDeviceCenterInternalService, CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'

import { authStore } from './auth-store'
export const cubeDeviceCenterInternalService = new CubeDeviceCenterInternalService(authStore)
export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
