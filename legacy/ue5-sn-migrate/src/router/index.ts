import { createRouter, createMemoryHistory, RouteRecordRaw, RouteLocationNormalized } from "vue-router";
import { getToken, getNowEnterprise } from "@/utils/auth";
import { authStore } from '@/api/auth-store'
import { initCubePlayerAuth } from '@ghcloud/cube-player'
import { loadPlayerSDK } from '@ghcloud/cube-player'


const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "home",
        component: async () => import(`@/${window.config.entry??'views'}/index.vue`),
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
    sessionStorage.removeItem("GH-Token");
    sessionStorage.removeItem("GH-NowEnterprise");
    next();
    return
  } 

  const token = await getToken()
  const nowEnterprise = await getNowEnterprise()
  if (token && token.access_token && nowEnterprise) {
    authStore.token = token.access_token
    authStore.tenant = nowEnterprise.code
    initCubePlayerAuth(authStore)
    loadPlayerSDK()
    next()
  }else{
    sessionStorage.removeItem("GH-Token");
    sessionStorage.removeItem("GH-NowEnterprise");
    next({ path: "/login"});
  }
})
export default router