import { CubeFlowService, CubeAttendanceService } from '@ghcloud/cube-stream-engine-service'
import { authStore } from './auth-store'
export let cubeFlowService = new CubeFlowService(authStore)
export let cubeAttendanceService = new CubeAttendanceService(authStore)

export const reloadServer = (): void => {
  cubeFlowService = new CubeFlowService(authStore)
  cubeAttendanceService = new CubeAttendanceService(authStore)
}
