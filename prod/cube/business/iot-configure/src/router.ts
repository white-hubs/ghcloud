import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import SystemConfig from '@/routers/system'
import { getToken } from './tools'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: 'login'
  },
  {
    name: 'login',
    path: '/login',
    component: async () => (await import('@/views/login/login')).Login
  },
  ...SystemConfig,
  {
    name: '404',
    path: '/404',
    component: async () => (await import('@/views/404')).NotFound,
  },
  {
    name: 'error',
    path: '/error',
    component: async () => (await import('@/views/error')).Error,
  },
  // {
  //   name: 'form-design',
  //   path: '/form-design',
  //   component: async () => (await import('@/views/form-design/form-design')).FormDesign,
  // },
  {
    path: '/:pathMatch(.*)',
    redirect: '/404'
  }
]
const router = createRouter({
  history: createWebHistory((import.meta as unknown as { env: { BASE_URL: string; }; }).env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const token = getToken()
  if (token) {
    next()
  } else {
    if (to.name === 'login' || to.name === 'form-design') {
      next()
    } else {
      next({ path: '/login' })
    }
  }
})

export default router
