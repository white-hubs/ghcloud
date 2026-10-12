import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeElectronPatrolService } from '@ghcloud/cube-electronic-patrol-service'
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { authStore } from './auth-store'

export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeMdataService = new CubeMdataService(authStore)
export const cubeFileService = new CubeFileService(authStore)
export const cubeElectronPatrolService = new CubeElectronPatrolService(authStore)
export const cubeMessageCenterService = new CubeMessageCenterService(authStore)
