import type { RouteRecordRaw } from 'vue-router'
import { environmentMonitor } from './environment-monitor'
export const routes: RouteRecordRaw[] = [
  {
    name: 'brightness-detection',
    path: '/brightness-detection',
    component: async () => (await import('@/views/brightness-detection/brightness-detection')).BrightnessDetection
  },
  {
    name: 'visibility-detection',
    path: '/visibility-detection',
    component: async () => (await import('@/views/visibility-detection/visibility-detection')).VisibilityDetection
  },
  {
    name: 'co-detection',
    path: '/co-detection',
    component: async () => (await import('@/views/co-detection/co-detection')).CoDetection
  },
  {
    name: 'wind-speed-detection',
    path: '/wind-speed-detection',
    component: async () => (await import('@/views/wind-speed-detection/wind-speed-detection')).WindSpeedDetection
  },
  ...environmentMonitor
]
