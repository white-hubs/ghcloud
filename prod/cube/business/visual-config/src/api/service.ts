import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeTypeService, CubePropertyService } from '@ghcloud/cube-risk-management-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeVisualizationService } from '@ghcloud/cube-visualization-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { authStore } from './auth-store'

export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
export const cubePropertyService = new CubePropertyService(authStore)
export const cubeMdataService = new CubeMdataService(authStore)
export const cubeTypeService = new CubeTypeService(authStore)
export const cubeFileService = new CubeFileService(authStore)
export const cubeVisualizationService = new CubeVisualizationService(authStore)
export const cubeDictionaryService = new CubeDictionaryService(authStore)
