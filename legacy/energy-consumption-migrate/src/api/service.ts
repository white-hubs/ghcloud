import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeMdataService } from "@ghcloud/cube-mdata-service"
import { CubeFileService } from "@ghcloud/cube-file-service"
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { authStore } from './auth-store'

export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
export const cubeMdataService = new CubeMdataService(authStore)
export const cubeFileService = new CubeFileService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)

