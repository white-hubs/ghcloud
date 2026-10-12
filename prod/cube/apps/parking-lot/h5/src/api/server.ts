import { CubeParkingLotService } from '@ghcloud/cube-parking-lot-service'
import { authStore } from './auth-store'
import { CubeMaintainService } from '@ghcloud/cube-maintain-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeFaultRepairService } from '@ghcloud/cube-fault-repair-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeOcrService } from '@ghcloud/cube-ocr-service'
import { CubeTrafficStatisticsService } from '@ghcloud/cube-traffic-detection-service'

export const cubeParkingLotService = new CubeParkingLotService(authStore)
export const cubeFaultRepairService = new CubeFaultRepairService(authStore)
export const cubeFileService = new CubeFileService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeMaintainService = new CubeMaintainService(authStore)
export const cubeOcrService = new CubeOcrService(authStore)
export const cubeTrafficStatisticsService = new CubeTrafficStatisticsService(authStore)
