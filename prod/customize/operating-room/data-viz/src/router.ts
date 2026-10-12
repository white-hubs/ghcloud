import { createRouter, type RouteRecordRaw, createWebHashHistory } from 'vue-router'
import { initAuthStore } from './api/auth-store'
import { reloadService, service } from './api/service'
import { useUser } from './hook/use-user'
import { storeUser } from './store/user'
import { mqttInit, mqttServiceInstance } from './hook/use-props'
import { storeCache } from './store/cache'
import { useCache } from './hook/use-cache'


export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/entry'
  },
  {
    path: '/entry',
    name: 'entry',
    component: async () => (await import('@/views/entry/entry')).Entry
  },
  {
    path: '/nurse-station',
    name: 'nurseStation',
    component: async () => (await import('@/views/nurse-station/nurse-station')).NurseStation
  },
  {
    path: '/entrance-screen',
    name: 'entranceScreen',
    component: async (): Promise<unknown> => (await import('@/views/template-three/entrance-screen')).EntranceScreen
  },
]

export const router = createRouter({
  history: createWebHashHistory('/apps/operating-room/data-viz/'),
  routes
})
router.beforeEach(async (to, from, next) => {
  const cacheStore = storeCache()
  if (to.path === '/') {
    next()
    return
  }
  // 检查token
  if (to.path !== '/entry' && !cacheStore.mqttService) {
    next('/entry')
  } else {
    // 获取用户信息
    const token = window.businessData?.authToken ?? null
    const tenant = window.businessData?.authNowEnterprise ?? null
    // if (!tenant || !token) return message.error('未获取到用户信息')
    initAuthStore({
      tenant: tenant?.code || '',
      token: token?.accessToken || '',
    })
    reloadService()
    try {
      const { getUserInfo } = useUser()
      await getUserInfo(token?.userID || '')
    } catch {

    }

    const userStore = storeUser()
    userStore.tenantInfo = tenant
    const { updateCache } = useCache()
    updateCache()
    if (!mqttServiceInstance && cacheStore.mqttService?.ipcUrl) {
      mqttInit(service.cubeOperatingRoomMqttSubscribeService)
    }
    next()
  }
})
