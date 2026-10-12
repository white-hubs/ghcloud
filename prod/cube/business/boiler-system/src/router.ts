import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    name: 'electricity',
    path: '/electricity',
    component: async () => (await import('@/views/electricity')).ElectricityDetails,
    meta: {
      title: '用电明细'
    }
  },
  {
    name: 'temperature',
    path: '/temperature',
    component: async () => (await import('@/views/temperature')).TemperatureDetail,
    meta: {
      title: '温度明细'
    }
  },
  {
    name: 'water',
    path: '/water',
    component: async () => (await import('@/views/water')).WaterDetail,
    meta: {
      title: '用水明细'
    }
  },
]
