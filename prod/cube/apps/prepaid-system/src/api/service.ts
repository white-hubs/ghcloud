import { CubeTypeService, CubePropertyService, CubeIdentityService, CubeMaintainService, CubeMessageService, CubeStallService } from '@ghcloud/cube-risk-management-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'

import { authStore } from './auth-store'
export const cubePropertyService = new CubePropertyService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeMdataService = new CubeMdataService(authStore)
export const cubeMaintainService = new CubeMaintainService(authStore)
export const cubeMessageService = new CubeMessageService(authStore)
export const cubeStallService = new CubeStallService(authStore)
export const cubeTypeService = new CubeTypeService(authStore)
export const cubeIdentityService = new CubeIdentityService(authStore)
