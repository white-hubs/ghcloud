import { CubeMaintainService } from '@ghcloud/cube-maintain-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeFaultRepairService } from '@ghcloud/cube-fault-repair-service'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { authStore } from './auth-store'

export const cubeMaintainService = new CubeMaintainService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeFaultRepairService = new CubeFaultRepairService(authStore)
export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
export const cubeFileService = new CubeFileService(authStore)
