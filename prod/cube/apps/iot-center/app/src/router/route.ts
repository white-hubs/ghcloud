import type { RouteOption } from './router'

export enum RoutePathEnum {
  ALARMCONFIG = '/alarm',
  ALARMCONFIGLIST = '/alarmConfigList',
}

export const routes: RouteOption[] = [
  {
    path: RoutePathEnum.ALARMCONFIGLIST,
    component: async () => (await import('../pages/generic-alarm-config-list/index')).AlarmConfigList
  },
  {
    path: RoutePathEnum.ALARMCONFIG,
    component: async () => (await import('../pages/generic-alarm-config/index')).AlarmConfig
  },

]
