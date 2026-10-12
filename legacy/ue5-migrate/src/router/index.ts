import { createRouter, createMemoryHistory, RouteRecordRaw, RouteLocationNormalized } from "vue-router";
import { authStore } from '@/api/auth-store'
import { initCubePlayerAuth } from '@ghcloud/cube-player'
import { loadPlayerSDK } from '@ghcloud/cube-player'
import { CubeMfRootGlobalState } from '@ghcloud/cube-mf-root'


const routes: Array<RouteRecordRaw> = [
    //   {
    //     path: "/",
    //     name: "home",
    //     component: async () => (await import('@/pages/index')).ViewPage, // 可视化重构入口
    // },
    {
        path: "/",
        name: "home",
        component: async () => import(`@/${window.config.entry??'views'}/index.vue`),// 可视化旧版本入口
    },
    {
      path: "/login",
      name: "login",
      component: async () => import(`@/login/index.vue`),
    }
]
const router = createRouter({
    history: createMemoryHistory(),
    routes
})
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: any) => {
  if (to.name === "login") {
    sessionStorage.clear()
    next();
    return
  } 
  const authInfo = CubeMfRootGlobalState.getInstance().mfRootState.authInfo
   
  if (authInfo?.token) {
    authStore.token = authInfo.token
    authStore.tenant = authInfo.tenant
    initCubePlayerAuth(authStore)
    loadPlayerSDK()
    next()
  }else{
    sessionStorage.clear()
    next({ path: "/login"});
  }
})
export default router