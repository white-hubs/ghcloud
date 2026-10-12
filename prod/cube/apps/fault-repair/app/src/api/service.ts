import { authStore } from './auth-store'
import { CubeMaintainService } from '@ghcloud/cube-maintain-service'
import { CubeFaultRepairService } from '@ghcloud/cube-fault-repair-service'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'

export const cubeFileService = new CubeFileService(authStore)
export const cubeFaultRepairService = new CubeFaultRepairService(authStore)
export const cubeMaintainService = new CubeMaintainService(authStore)
export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
