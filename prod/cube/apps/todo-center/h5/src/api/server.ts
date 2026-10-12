import { CubeTodoTaskStatService } from '@ghcloud/cube-todo-center-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { authStore } from './auth-store'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'

export const cubeTodoTaskStatService = new CubeTodoTaskStatService(authStore)
export const cubeFileService = new CubeFileService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
