import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { authStore } from './auth-store'
export const cubeMessageCenterService = new CubeMessageCenterService(authStore)
export const cubeFileService = new CubeFileService(authStore)