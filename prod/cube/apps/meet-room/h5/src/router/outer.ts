import { authStore } from '@/api/auth-store'
import type { AppRoutes } from '@ghcloud/cube-app-generic-component'
import { CubeAuthService } from '@ghcloud/cube-auth-service'
import type { CubeTerminalEnum } from '../../../../../protocol/src/cube-terminal.protocol'

// 跳转外部应用路由
export const outerAppRouters: AppRoutes = [
  {
    name: 'baseMonitorDevice',
    path: '/apps/@ghcloud/cube-iot-center-h5/#/baseMonitorDevice',
    meta: {
      isOuter: true,
      title: '会议室设备',
    },
    component: () => null,
    getQuery: async (): Promise<Record<string, string >> => {
      const cubeAuthService = new CubeAuthService(authStore.terminal as CubeTerminalEnum, authStore.tenant, authStore.token)
      return {
        applicationCode: __ENV__.applicationCode,
        'cube-secret': await cubeAuthService.getSecretByToken()
      }
    }
  }
]
