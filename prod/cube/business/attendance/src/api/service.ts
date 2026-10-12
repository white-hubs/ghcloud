import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { authStore } from './auth-store'

export const cubeDictionaryService = new CubeDictionaryService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeMessageCenterService = new CubeMessageCenterService(authStore)
