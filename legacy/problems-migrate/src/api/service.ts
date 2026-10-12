import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { authStore } from './auth-store'

export const cubeMessageCenterService = new CubeMessageCenterService(authStore)
