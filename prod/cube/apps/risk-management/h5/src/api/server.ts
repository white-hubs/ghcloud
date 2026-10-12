import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubePropertyService, CubeMaintainService, CubeTypeService } from '@ghcloud/cube-risk-management-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { ServiceIntercept } from '@ghcloud/cube-service-intercept'

import { authStore } from './auth-store'

export const cubeFileService = new CubeFileService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubePropertyService = new CubePropertyService(authStore)
export const cubeDictionaryService = new CubeDictionaryService(authStore)
export const cubeMdataService = new CubeMdataService(authStore)
export const cubeMaintainService = new CubeMaintainService(authStore)
export const cubeTypeService = new CubeTypeService(authStore)
export const serviceIntercept = new ServiceIntercept()
