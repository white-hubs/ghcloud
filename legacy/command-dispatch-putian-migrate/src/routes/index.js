import { getToken, storeToken } from "@/services/AccountService";
import { createRouter, createWebHistory } from "vue-router";
import qs from "qs";
const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/login.vue"),
  },
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
  {
    name: "404",
    path: "/404",
    component: () => import("@/views/Error/404.vue"),
  },
  {
    name: "401",
    path: "/401",
    component: () => import("@/views/Error/401.vue"),
  },
];

const router = createRouter({
  history: createWebHistory('/command-dispatch'),
  routes,
});

router.beforeEach(async (to, from, next) => {
  let token = await getToken();
  // const params = window.location.href?.split("?")[1];
  if (token && token.access_token) {
    const arr = to.fullPath.split("/portal/");
    if (arr.length >= 3) {
      next("/portal/" + arr[arr.length - 1]);
    } else {
      next();
    }
  } else {
    const params = window.location.search?.split("?")[1];
 
    if (params && params.includes("access_token")) {
      token = qs.parse(params);
      sessionStorage.setItem('GH-NowEnterprise', qs.parse(params).nowEnterprise)
      for (const key in token) {
        if(token[key]==='false'){
          token[key]=false
        }else if(token[key]==='true'){
          token[key]=true
        }
      }
      storeToken(token);
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
