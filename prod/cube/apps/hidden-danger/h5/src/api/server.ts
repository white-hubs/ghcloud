import { CubeMaintainService } from '@ghcloud/cube-maintain-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { authStore } from './auth-store'
import { CubeHiddenDangerService } from '@ghcloud/cube-hidden-danger-service'
import { CubeFileService } from '@ghcloud/cube-file-service'

export const cubeMaintainService = new CubeMaintainService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeHiddenDangerService = new CubeHiddenDangerService(authStore)
export const cubeFileService = new CubeFileService(authStore)
