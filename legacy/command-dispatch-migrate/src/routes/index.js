import { getToken, storeToken } from "@/services/AccountService";
import { createRouter, createMemoryHistory, createWebHistory } from "vue-router";
import qs from "qs";
import { CubeAuthService } from "@/api/cube-auth-service-es/main.js"
import { getTenantInfo } from "@/api/ouaa";
import { logout } from "@/services/AccountService"
import { initCubePlayerAuth,loadPlayerSDK } from "@ghcloud/cube-player";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/login.vue"),
  },
  {
    path: "/",
    component: () => import("@/views/traffic/commandDispatch/index.vue"),
  },
  {
    path: "/command-dispatch",
    component: () => import("@/views/traffic/commandDispatch/index.vue"),
  },
  {
    path: "/commandDispatch",
    component: () => import("@/views/traffic/commandDispatch/index.vue"),
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
// 初始化token
const initPlayerAuth = () => {
  const token = JSON.parse(sessionStorage.getItem('GH-Token')).access_token
  const tenant = JSON.parse(sessionStorage.getItem('GH-NowEnterprise')).code
  initCubePlayerAuth({
    token,
    tenant,
    terminal: 'command-dispatch-app'
  })
  loadPlayerSDK()
}
async function getAuthBySecret(secret) {
  const cubeAuthService = new CubeAuthService('command-dispatch-app')
  try {
    const res = await cubeAuthService.getTokenBySecret(secret)
    const token = {
      access_token: res.accessToken,
      refresh_token: res.refreshToken,
      expires_in: res.expires_in,
      token_type: 'bearer'
    }
    storeToken(token)
    sessionStorage.setItem("GH-NowEnterprise", JSON.stringify({ code: res.tenant }));
    const tenantData = await getTenantInfo({ id: res.tenant });
    sessionStorage.setItem('set-secret-token', 'true')
    sessionStorage.setItem("GH-NowEnterprise", JSON.stringify(tenantData));
  } catch (error) {
    logout()
  }
}
// 交换token
const exchangeToken = async () => {
  const params = window.location.search?.split("?")[1];
  const token = qs.parse(params);
  await getAuthBySecret(token['cube-secret'])
  initPlayerAuth()
}
router.beforeEach(async (to, from, next) => {
  const params = window.location.search?.split("?")[1];
  const setSecretToken = sessionStorage.getItem('set-secret-token')
  if (!setSecretToken && qs.parse(params)['cube-secret']) {
    await exchangeToken()
    next();
  }
  let token = await getToken();
  if (token && token.access_token) {
    const arr = to.fullPath.split("/portal/");
    if (arr.length >= 3) {
      next("/portal/" + arr[arr.length - 1]);
    } else {
      initPlayerAuth()
      next();
    }
  } else {
    if (params && params.includes("access_token")) {
      token = qs.parse(params);
      sessionStorage.setItem('GH-NowEnterprise', qs.parse(params).nowEnterprise)
      for (const key in token) {
        if (token[key] === 'false') {
          token[key] = false
        } else if (token[key] === 'true') {
          token[key] = true
        }
      }
      storeToken(token);
      initPlayerAuth()
      next();
    }

    if (to.name === "Login") {
      next();
    } else {
      next({ path: "/login", replace: true });
    }
  }
});

export default router;
