import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeVisitorManagementService } from '@ghcloud/cube-visitor-management-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeAuthService } from '@ghcloud/cube-auth-service'
import { authStore } from './auth-store'
import type { CubeTerminalEnum } from '@ghcloud/cube-protocol'
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeMdataService = new CubeMdataService(authStore)
export const cubeVisitorManagementService = new CubeVisitorManagementService(authStore)
export const cubeSecurityService = new CubeSecurityManagementService(authStore)
export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
export const cubeAuthService = new CubeAuthService(authStore.terminal as CubeTerminalEnum, authStore.tenant, authStore.token)
