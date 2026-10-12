import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { authStore } from './auth-store'

export const cubeMdataService = new CubeMdataService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
