import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'

import { authStore } from './auth-store'

export const cubeMessageCenterService = new CubeMessageCenterService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
