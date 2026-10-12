import { authStore } from './auth-store'
import { CubeTodoTaskStatService } from '@ghcloud/cube-todo-center-service'


export let cubeTodoTaskStatService = new CubeTodoTaskStatService(authStore)

export function initServer (): void{
  cubeTodoTaskStatService = new CubeTodoTaskStatService(authStore)
}