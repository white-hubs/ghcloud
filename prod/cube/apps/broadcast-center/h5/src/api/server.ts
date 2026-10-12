import { CubeBroadcastService } from '@ghcloud/cube-broadcast-center-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeAuthService } from '@ghcloud/cube-auth-service'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { authStore } from './auth-store'
import type { CubeTerminalEnum } from '@ghcloud/cube-protocol'

export const cubeBroadcastService = new CubeBroadcastService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeSecurityManagementService = new CubeSecurityManagementService(authStore)
export const cubeAuthService = new CubeAuthService(authStore.terminal as CubeTerminalEnum, authStore.tenant, authStore.token)
