import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { authStore } from './auth-store'

export const cubeDictionaryService = new CubeDictionaryService(authStore)
export const cubeMdataService = new CubeMdataService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeFileService = new CubeFileService(authStore)
export const cubeMessageCenterService = new CubeMessageCenterService(authStore)

