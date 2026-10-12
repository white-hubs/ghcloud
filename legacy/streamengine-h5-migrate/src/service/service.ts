import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeMaintainService } from '@ghcloud/cube-maintain-service'
import { CubeOuaaService } from "@ghcloud/cube-ouaa-service"
import { authStore } from './auth-store'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeParkingLotService } from '@ghcloud/cube-parking-lot-service'
import { CubeSmallEngineeringService } from '@ghcloud/cube-small-engineering-service'
import { CubePersonnelManagementService } from '@ghcloud/cube-personnel-management-service'
import { CubeOcrService } from '@ghcloud/cube-ocr-service'

export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
export const cubeOuaaService=new CubeOuaaService(authStore)
export const cubeMaintainService = new CubeMaintainService(authStore)
export const cubeFileService=new CubeFileService(authStore)
export const cubeParkingLotService = new CubeParkingLotService(authStore)
export const cubeSmallEngineeringService = new CubeSmallEngineeringService(authStore)
export const cubePersonnelManagementService = new CubePersonnelManagementService(authStore)
export const cubeOcrService = new CubeOcrService(authStore)